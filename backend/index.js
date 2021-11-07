/*
  dependencies
*/
const express = require('express')
const admin = require('firebase-admin')
// const inspect = require('util').inspect
const Busboy = require('busboy')
const path = require('path')
const os = require('os')
const fs = require('fs')
const UUID = require('uuid-v4')

/*
  config - express
*/
const app = express()

/*
  config - firebase
*/
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gardenapp-b5097.appspot.com'
})

const db = admin.firestore()
const bucket = admin.storage().bucket()

/*
  endpoint - Get posts
*/
app.get('/posts', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')
  const posts = []
  db.collection('posts').orderBy('date', 'desc').get().then((snapshot) => {
    snapshot.forEach((doc) => {
      posts.push(doc.data())
    })
    response.send(posts)
  })
})

/*
  endpoint - Get comments
*/
app.get('/comments', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')
  const comments = []
  db.collection('comments').get().then((snapshot) => {
    snapshot.forEach((doc) => {
      comments.push(doc.data())
    })
    response.send(comments)
  })
})

/*
  endpoint - Get Plant Profiles
*/
app.get('/plants', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')
  const plants = []
  db.collection('plants').get().then((snapshot) => {
    snapshot.forEach((doc) => {
      plants.push(doc.data())
    })
    response.send(plants)
  })
})

/*
endpoint - Add Comment
*/
app.post('/addcomment', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const busboy = new Busboy({ headers: request.headers })

  const fields = {}

  // postid author comment time
  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    fields[fieldname] = val
  })

  busboy.on('finish', async function () {
    const commentsRef = db.collection('comments')
    commentsRef.doc(fields.id).set({
      id: fields.id,
      comment: fields.comment,
      date: parseInt(fields.date),
      author: fields.author,
      postid: fields.postid
    }).then(() => {
      response.send('Post added: ' + fields.id)
    })
  })
  request.pipe(busboy)
})

/*
  endpoint - timeline
*/
app.get('/timeline', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const pathsplit = request.originalUrl.split('=')
  const plantRef = db.collection('garden').doc(pathsplit[1])

  const posts = []
  plantRef.collection('timeline').orderBy('date', 'desc').get().then((snapshot) => {
    snapshot.forEach((doc) => {
      posts.push(doc.data())
    })
    response.send(posts)
  })
})

/*
  endpoint - get users
*/
app.get('/users', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const userRef = db.collection('users')

  const posts = []
  userRef.orderBy('name', 'asc').get().then((snapshot) => {
    snapshot.forEach((doc) => {
      posts.push(doc.data())
    })
    response.send(posts)
  })
})

/*
  endpoint - get people from user
*/
app.get('/people', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const pathsplit = request.originalUrl.split('=')
  const plantRef = db.collection('users').doc(pathsplit[1])

  const posts = []
  plantRef.collection('people').orderBy('name', 'asc').get().then((snapshot) => {
    snapshot.forEach((doc) => {
      posts.push(doc.data())
    })
    response.send(posts)
  })
})

/*
endpoint - Add Person
*/
app.post('/addperson', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const busboy = new Busboy({ headers: request.headers })

  const fields = {}

  // postid author comment time
  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    fields[fieldname] = val
  })

  busboy.on('finish', async function () {
    const userRef = db.collection('users').doc(fields.userid).collection('people')
    userRef.doc(fields.id).set({
      id: fields.id,
      name: fields.name,
      colour: '#00a300'
    }).then(() => {
      response.send('Post added: ' + fields.id)
    })
  })
  request.pipe(busboy)
})

/*
endpoint - delete Person
*/
app.post('/deleteperson', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const busboy = new Busboy({ headers: request.headers })

  const fields = {}

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    fields[fieldname] = val
  })

  busboy.on('finish', async function () {
    db.collection('users').doc(fields.userid).collection('people').doc(fields.personid).delete()
  })
  request.pipe(busboy)
})

/*
endpoint - createPost
*/
app.post('/createpost', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const uuid = UUID()

  const busboy = new Busboy({ headers: request.headers })

  const fields = {}
  let fileData = {}

  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    const filepath = path.join(os.tmpdir(), uuid)
    file.pipe(fs.createWriteStream(filepath))
    fileData = { filepath, mimetype }
  })

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    fields[fieldname] = val
  })

  busboy.on('finish', function () {
    bucket.upload(
      fileData.filepath,
      {
        uploadType: 'media',
        metadata: {
          metadata: {
            contentType: fileData.mimetype,
            firebaseStorageDownloadTokens: uuid
          }
        }
      },
      (err, uploadedFile) => {
        if (!err) {
          createDocument(uploadedFile)
        }
      }
    )

    function createDocument (uploadedFile) {
      db.collection('posts').doc(fields.id).set({
        id: fields.id,
        caption: fields.caption,
        date: parseInt(fields.date),
        person: fields.person,
        personcolour: fields.personcolour,
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${uuid}`,
        author: fields.author
      }).then(() => {
        response.send('Post added: ' + fields.id)
      })
    }
  })
  request.pipe(busboy)
})

/*
endpoint - deletePost
*/
app.post('/deletepost', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const busboy = new Busboy({ headers: request.headers })

  const fields = {}

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    fields[fieldname] = val
  })

  busboy.on('finish', async function () {
    db.collection('posts').doc(fields.postid).delete()
  })
  request.pipe(busboy)
})

/*
endpoint - deletePicture
*/
app.post('/deletepicture', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const busboy = new Busboy({ headers: request.headers })

  const fields = {}

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    fields[fieldname] = val
  })

  busboy.on('finish', async function () {
    db.collection('garden').doc(fields.plantid).collection('timeline').doc(fields.pictureid).delete()
  })
  request.pipe(busboy)
})

/*
endpoint - add Timeline photo
*/
app.post('/addTimeline', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const uuid = UUID()

  const busboy = new Busboy({ headers: request.headers })

  const fields = {}
  let fileData = {}

  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    const filepath = path.join(os.tmpdir(), uuid)
    file.pipe(fs.createWriteStream(filepath))
    fileData = { filepath, mimetype }
  })

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    fields[fieldname] = val
  })

  busboy.on('finish', function () {
    bucket.upload(
      fileData.filepath,
      {
        uploadType: 'media',
        metadata: {
          metadata: {
            contentType: fileData.mimetype,
            firebaseStorageDownloadTokens: uuid
          }
        }
      },
      (err, uploadedFile) => {
        if (!err) {
          createDocument(uploadedFile)
        }
      }
    )

    function createDocument (uploadedFile) {
      db.collection('garden').doc(fields.origin).collection('timeline').doc(fields.id).set({
        id: fields.id,
        date: parseInt(fields.date),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${uuid}`
      }).then(() => {
        response.send('Timeline photo added: ' + fields.id)
      })
    }
  })
  request.pipe(busboy)
})

/*
  endpoint - get garden (all plants)
*/
app.get('/garden', async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const plants = []
  db.collection('garden').orderBy('datePlanted', 'desc').get().then((snapshot) => {
    snapshot.forEach((doc) => {
      plants.push(doc.data())
    })
    response.send(plants)
  })
})

/*
  endpoint - get plantinfo
*/
app.get('/plantinfo', async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const pathsplit = request.originalUrl.split('=')
  let plantinfo = []
  const plantRef = db.collection('plants').doc(pathsplit[1])
  const doc = await plantRef.get()
  if (!doc.exists) {
    console.log('No such document')
  } else {
    plantinfo = doc.data()
  }
  response.send(plantinfo)
})

/*
  endpoint - get allplants
*/
app.get('/allplants', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')
  const plants = []
  db.collection('plants').get().then((snapshot) => {
    snapshot.forEach((doc) => {
      plants.push(doc.data())
    })
    response.send(plants)
  })
})

/*
endpoint - deletePlant
*/
app.post('/deleteplant', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const busboy = new Busboy({ headers: request.headers })

  const fields = {}

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    fields[fieldname] = val
  })

  busboy.on('finish', async function () {
    db.collection('garden').doc(fields.plantid).delete()
  })
  request.pipe(busboy)
})

/*
  endpoint - get plantedinfo (from garden)
*/
app.get('/plantedinfo', async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')
  const pathsplit = request.originalUrl.split('=')
  let plantinfo = []
  const plantRef = db.collection('garden').doc(pathsplit[1])
  const doc = await plantRef.get()
  if (!doc.exists) {
    console.log('No such document')
  } else {
    plantinfo = doc.data()
  }
  response.send(plantinfo)
})

/*
endpoint - Change person colour
*/
app.post('/personcolour', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const busboy = new Busboy({ headers: request.headers })

  const fields = {}

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    fields[fieldname] = val
  })

  busboy.on('finish', async function () {
    const query = db.collection('users').doc('48EfQ8FgIgA7nYlLTqVZ').collection('people').where('name', '==', fields.name)
    const promises = []
    query.get().then(snapshots => {
      snapshots.forEach(snapshot => {
        promises.push(snapshot.ref.update({ colour: fields.colour }))
      })
      return Promise.all(promises)
    })
  })
  request.pipe(busboy)
})

/*
endpoint - Change person name
*/
app.post('/personname', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const busboy = new Busboy({ headers: request.headers })

  const fields = {}

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    fields[fieldname] = val
  })

  busboy.on('finish', async function () {
    const personRef = db.collection('users').doc(fields.userid).collection('people')
    personRef.doc(fields.id).update({
      name: fields.newname
    }).then(() => {
      response.send('Post added: ' + fields.id)
    })
  })
  request.pipe(busboy)
})

/*
endpoint - Add Plant
*/
app.post('/addplant', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*')

  const uuid = UUID()

  const busboy = new Busboy({ headers: request.headers })

  const fields = {}
  let fileData = {}

  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    const filepath = path.join(os.tmpdir(), uuid)
    file.pipe(fs.createWriteStream(filepath))
    fileData = { filepath, mimetype }
  })

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    fields[fieldname] = val
  })

  busboy.on('finish', function () {
    console.log('image: ' + fields.image)
    if (fields.image === undefined) {
      bucket.upload(
        fileData.filepath,
        {
          uploadType: 'media',
          metadata: {
            metadata: {
              contentType: fileData.mimetype,
              firebaseStorageDownloadTokens: uuid
            }
          }
        },
        (err, uploadedFile) => {
          if (!err) {
            createDocument(uploadedFile)
          }
        }
      )
    } else if (fields.image === '') {
      const gardenRef = db.collection('garden')
      gardenRef.doc(fields.plantedId).set({
        user: fields.user,
        plantedId: fields.plantedId,
        plantId: fields.plantId,
        datePlanted: parseInt(fields.date),
        icon: fields.icon,
        name: fields.name,
        image: 'https://firebasestorage.googleapis.com/v0/b/gardenapp-b5097.appspot.com/o/Leafy-Vegetable-Garden.jpg?alt=media&token=647206fa-7704-4c71-9e0d-71d988a5d707'
      }).then(() => {
        response.send('Post added: ' + fields.id)
      })
    } else {
      const gardenRef = db.collection('garden')
      gardenRef.doc(fields.plantedId).set({
        user: fields.user,
        plantedId: fields.plantedId,
        plantId: fields.plantId,
        datePlanted: parseInt(fields.date),
        icon: fields.icon,
        name: fields.name,
        image: fields.image
      }).then(() => {
        response.send('Post added: ' + fields.id)
      })
    }

    function createDocument (uploadedFile) {
      const gardenRef = db.collection('garden')
      gardenRef.doc(fields.plantedId).set({
        user: fields.user,
        plantedId: fields.plantedId,
        plantId: fields.plantId,
        datePlanted: parseInt(fields.date),
        icon: fields.icon,
        name: fields.name,
        image: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${uuid}`
      }).then(() => {
        response.send('Post added: ' + fields.id)
      })
    }
  })
  request.pipe(busboy)
})

/*
  listen
*/
app.listen(process.env.PORT || 3000)

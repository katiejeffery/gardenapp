<template>
  <q-page padding class="flex column content-center page">
    <!-- Header -->
    <div class="header fixed-top">
      <q-icon size="lg" name="mdi-arrow-left" @click="$router.go(-1)" style="position:absolute;left:20px;"/>
      Plant Info
    </div>

    <!-- Video -->
    <video
      v-show="!imageCaptured"
      class="camera"
      autoplay
      playsinline
      ref="video"
    />

    <!-- Captured Image -->
    <canvas
      v-show="imageCaptured"
      ref="canvas"
      class="camera"
      height="240"
    />

    <!-- Take Photo Button -->
    <div class="row justify-center q-mt-lg q-mb-md">
      <q-btn
        @click="captureImage"
        icon="mdi-camera"
        color="primary"
        size="lg"
        round
      />
    </div>

    <!-- Select Photo -->
    <q-file
      v-if="ready"
      v-model="imageUpload"
      @input="captureImageFallback"
      outlined
      label="Choose an image"
      accept="image/*"
    >
      <template v-slot:prepend>
        <q-icon name="mdi-paperclip" />
      </template>
    </q-file>

    <!-- Caption -->
    <div
      v-if="this.origin=='social'"
      class="row justify-center q-ma-md"
    >
      <q-input
        v-model="post.caption"
        class="col"
        label="Caption"
        dense
      />
    </div>

    <!-- People list -->
    Who took the photo? (Optional)
    <div
      class="flex row camera-user-container"
    >
      <div
        v-for="person in people"
        :key="person.id"
        class="flex flex-center camera-user">
        <div
          class="flex flex-center camera-username-container"
          :style="[(selectedPerson===person.name) ? {'border-style' : 'solid', 'border-width': '5px', 'border-color': 'red', 'background-color': person.colour} : {'background-color': person.colour}]"
          @click="selectPerson(person.name, person.colour)"
        >
          {{person.name}}
        </div>
      </div>
    </div>

    <!-- Post Image Button - SOCIAL -->
    <div
      v-if="this.origin=='social' && pictureTaken"
      class="row justify-center q-ma-md"
    >
      <q-btn
        @click="addPost()"
        unelevated
        rounded
        color="primary"
        label="Post Image"
      />
    </div>

    <!-- Post Image Button - TIMELINE -->
    <div
      v-if="this.origin!='social' && pictureTaken"
      class="row justify-center q-ma-md"
    >
      <q-btn
        @click="postTimeline()"
        unelevated
        rounded
        color="primary"
        label="Add Timeline Image"
      />
    </div>

  </q-page>
</template>

<style lang="scss">
.page {
  margin-top: 60px;
}
.header {
  display: flex;
  flex-direction: row;
  justify-content: center;
  font-size: 25px;
  padding: 10px;
  color: white;
  background-color: $primary;
  z-index: 100;
}
.camera {
  width: 80%;
}
.camera-user-container {
  margin-bottom: 10px;
}
.camera-user {
  width: 21%;
  height: 50px;
  margin-top: 15px;
  margin-left: 2%;
  margin-right: 2%;
}
.camera-username-container {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  font-size: 14px;
  color: white;
}
</style>

<script>
import { uid } from 'quasar'

export default {
  name: 'Camera',
  data () {
    return {
      ready: false,
      origin: null,
      post: {
        id: uid(),
        photo: null,
        date: Date.now(),
        caption: null
      },
      imageCaptured: false,
      imageUpload: [],
      hasCameraSupport: true,
      pictureTaken: false,
      people: [],
      selectedPerson: '',
      selectedColour: ''
    }
  },
  methods: {
    getPeople () {
      this.$axios.get(`${process.env.API}/people`, { params: { userid: this.userid } }).then((response) => {
        this.people = response.data
      }).catch(() => {
        this.$q.dialog({
          title: 'Error',
          message: 'Could not download people'
        })
      })
    },
    initCamera () {
      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        }
      }).then((stream) => {
        this.$refs.video.srcObject = stream
      }).catch(() => {
        this.hasCameraSupport = false
      })
    },
    captureImage () {
      this.pictureTaken = true
      const { video } = this.$refs
      const { canvas } = this.$refs
      canvas.width = video.getBoundingClientRect().width
      canvas.height = video.getBoundingClientRect().height
      const context = canvas.getContext('2d')
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      this.imageCaptured = true
      this.post.photo = this.dataURItoBlob(canvas.toDataURL())
      this.disableCamera()
    },
    captureImageFallback (file) {
      this.post.photo = file

      const { canvas } = this.$refs
      const context = canvas.getContext('2d')

      const reader = new FileReader()
      // eslint-disable-next-line arrow-parens
      reader.onload = event => {
        const img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          context.drawImage(img, 0, 0)
          this.imageCaptured = true
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file.target.files[0])
    },
    disableCamera () {
      this.$refs.video.srcObject.getVideoTracks().forEach((track) => track.stop())
    },
    dataURItoBlob (dataURI) {
      const byteString = atob(dataURI.split(',')[1])
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      const blob = new Blob([ab], { type: mimeString })
      return blob
    },
    postTimeline () {
      const formData = new FormData()
      formData.append('id', this.post.id)
      formData.append('photo', this.post.photo)
      formData.append('date', this.post.date)
      formData.append('origin', this.origin)

      this.$axios.post(`${process.env.API}/addTimeline`, formData).then(
        response => {
          console.log('response: ', response)
          this.$router.push({ name: 'plantinfo', params: { id: this.origin } })
        }).catch(err => {
        console.log('err: ', err)
      })
    },
    addPost () {
      const formData = new FormData()
      formData.append('id', this.post.id)
      formData.append('photo', this.post.photo)
      formData.append('date', this.post.date)
      formData.append('caption', this.post.caption)
      formData.append('author', this.username)
      formData.append('person', this.selectedPerson)
      formData.append('personcolour', this.selectedColour)

      this.$axios.post(`${process.env.API}/createpost`, formData).then(
        response => {
          console.log('response: ', response)
          this.$router.push({ name: 'social' })
        }).catch(err => {
        console.log('err: ', err)
      })
    },
    selectPerson (name, colour) {
      if (this.selectedPerson === name) {
        this.selectedPerson = ''
        this.selectedColour = ''
      } else {
        this.selectedPerson = name
        this.selectedColour = colour
      }
    }
  },
  created () {
    this.origin = this.$route.params.origin
  },
  mounted () {
    this.getPeople()
    this.initCamera()
  },
  beforeUnmount () {
    if (this.hasCameraSupport) {
      this.disableCamera()
    }
  },
  computed: {
    username: {
      get () {
        return this.$store.state.user.username
      }
    },
    userid: {
      get () {
        return this.$store.state.user.userid
      }
    }
  }
}
</script>

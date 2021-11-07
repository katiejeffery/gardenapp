<template>
  <q-page padding class="page">

    <!-- Header -->
    <div class="header fixed-top">
      <q-icon size="lg" name="mdi-arrow-left" @click="$router.go(-1)" style="position:absolute;left:20px;"/>
      Social
    </div>

    <!-- Post Image Button -->
    <div class="row justify-center q-ma-md">
      <router-link
        :to="{ name: 'camera', params: {origin:'social'} }"
        class="social-link">
        <q-btn
          unelevated
          rounded
          color="primary"
          icon="mdi-camera"
          label="Add a photo!"
          size="lg"
        />
      </router-link>
    </div>

    <!-- If Garden Empty -->
    <div
      v-if="!posts.length"
      class="posts-empty">
      There are no posts yet. <br/> Tap 'ADD A PHOTO' to get started!
    </div>

    <!-- Social Posts -->
    <q-card
      v-for="post in posts"
      :key="post.id"
      class="post-card q-mb-md"
      flat
      bordered
    >
      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <img style="object-fit:cover;" src="https://firebasestorage.googleapis.com/v0/b/gardenapp-b5097.appspot.com/o/logo.PNG?alt=media&token=72c707fa-6f83-4f48-87d8-6eb049ef8788">
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="post-author"> {{ post.author}} </q-item-label>
        </q-item-section>
        <!-- Delete Button -->
        <div class="delete-container">
          <q-btn
            v-if="post.author == username"
            class="cross-button"
            unelevated
            round
            color="red"
            icon="mdi-trash-can"
            size="md"
            @click="selectedPost=post.id;deletePrompt=true"
          />
        </div>
      </q-item>

      <!-- Delete Dialog -->
      <q-dialog v-model="deletePrompt">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Are you sure you want to delete this post?</div>
          </q-card-section>

          <q-card-actions align="right" class="flex row justify-around text-primary">
            <q-btn color="red" label="Delete Post" v-close-popup @click="deletePost()"/>
            <q-btn color="primary" label="Cancel" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-item
        v-if="post.person != '' ">
        <!-- Person -->
        <div
          class="social-person"
          v-bind:style="{ 'background-color': post.personcolour }">
          {{ post.person }}
        </div>
      </q-item>

      <q-separator />

      <!-- Image -->
      <div class="image-container">
        <q-img
          fit="scale-down"
          :src='post.imageUrl'
        />
      </div>

      <!-- Caption/Date -->
      <q-card-section>
        <div class="caption"> {{ post.caption }} </div>
        <div class="caption-date"> {{ niceDate(post.date) }} </div>
      </q-card-section>
      <q-separator />

      <!-- Comments -->
      <q-card-section>
        <q-item-label class="text-h6"> Comments </q-item-label>
        <!-- Add Comment -->
        <div class="add-comment" @click="commentPrompt=true; postid=post.id">
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img src="https://firebasestorage.googleapis.com/v0/b/gardenapp-b5097.appspot.com/o/logo.PNG?alt=media&token=72c707fa-6f83-4f48-87d8-6eb049ef8788">
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <div class="flex row">
                <div class="text-bold comment-author"> Add a comment... </div>
              </div>
            </q-item-section>
          </q-item>
        </div>
        <!-- Comment List -->
        <div
          v-for="comment in getComment(post.id)"
          :key="comment.id"
        >
          <q-item>
            <!-- avatar -->
            <q-item-section avatar>
              <q-avatar>
                <img src="https://firebasestorage.googleapis.com/v0/b/gardenapp-b5097.appspot.com/o/logo.PNG?alt=media&token=72c707fa-6f83-4f48-87d8-6eb049ef8788">
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <div class="flex row">
                <!-- author -->
                <div class="text-bold comment-author"> {{ comment.author }}: </div>
                <!-- comment -->
                <div class="comment-text"> {{ comment.comment }} </div>
              </div>
              <!-- date -->
              <div class="text-grey comment-date"> {{ niceDate(comment.date) }} </div>
            </q-item-section>
          </q-item>
        </div>

        <!-- Comment Dialog -->
        <q-dialog v-model="commentPrompt">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Write Comment</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-input dense v-model="comment" autofocus @keyup.enter="namePrompt = false" />
            </q-card-section>

            <q-card-actions align="right" class="text-primary">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn flat label="Post Comment" v-close-popup @click="addComment()"/>
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-card-section>
    </q-card>

  </q-page>
</template>

<style lang="scss">
.post-author {
  font-size: 30px;
  font-weight: bold;
  padding: 5px;
}
.post-card {
  .q-img {
    max-height: 280px;
  }
}
.image-container {
  width: 100%;
  background-color: #474747;
}
.comment-author {
  padding-right: 10px;
  font-size: 18px;
}
.comment-text {
  font-size: 18px;
}
.comment-date {
  font-size: 16px;
}
.add-comment {
  background-color:#E2E2E2;
  margin-top: 10px;
  font-size: 20px;
}
.caption {
  font-size: 26px;
}
.caption-date {
  font-size: 20px;
  color: gray;
}
.posts-empty {
  text-align: center;
  color: gray;
  padding: 30px;
  font-size: 28px;
}
.social-link {
  text-decoration: none;
}
.social-person {
  height: 100%;
  border-radius: 10px;
  font-size: 14px;
  color: white;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 5px;
  padding-bottom: 5px;
}
</style>

<script>
import { uid, date } from 'quasar'
export default {
  name: 'social',
  data () {
    return {
      posts: [],
      comments: [],
      commentPrompt: false,
      deletePrompt: false,
      comment: '',
      postid: '',
      selectedPost: ''
    }
  },
  computed: {
    niceDate () {
      return (v) => {
        return date.formatDate(v, 'MMMM D h:mmA')
      }
    },
    username: {
      get () {
        return this.$store.state.user.username
      }
    }
  },
  methods: {
    getPosts () {
      this.$axios.get(`${process.env.API}/posts`).then((response) => {
        this.posts = response.data
      }).catch(() => {
        this.$q.dialog({
          title: 'Error',
          message: 'Could not download posts'
        })
      })
    },
    getComments () {
      this.$axios.get(`${process.env.API}/comments`).then((response) => {
        this.comments = response.data
      }).catch(() => {
        this.$q.dialog({
          title: 'Error',
          message: 'Could not download posts'
        })
      })
    },
    addComment () {
      const formData = new FormData()
      formData.append('postid', this.postid)
      formData.append('comment', this.comment)
      formData.append('author', this.username)
      formData.append('date', Date.now())
      formData.append('id', uid())

      this.$axios.post(`${process.env.API}/addcomment`, formData).then(
        response => {
          console.log('response: ', response)
        }).catch(err => {
        console.log('err: ', err)
      })
      window.location.reload(false)
    },
    getComment (postid) {
      const comments = []
      this.comments.forEach(comment => {
        if (comment.postid === postid) {
          comments.push(comment)
        }
      })
      return comments
    },
    deletePost () {
      const formData = new FormData()
      formData.append('postid', this.selectedPost)

      this.$axios.post(`${process.env.API}/deletepost`, formData).then(
        response => {
          console.log('response: ', response)
        }).catch(err => {
        console.log('err: ', err)
      })
      window.location.reload(false)
    }
  },
  created () {
    this.getPosts()
    this.getComments()
  }
}
</script>

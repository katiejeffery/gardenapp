<template>
  <q-page padding class="flex column">
    <!-- Header -->
    <div class="header fixed-top">
      <q-icon size="lg" name="mdi-arrow-left" @click="$router.go(-1)" style="position:absolute;left:20px;"/>
      Profile
    </div>

    <div class="flex flex-center column text-white profile-container">
      <router-link
        v-if="ready"
        to="/settings"
        class="profile-link">
        <q-icon name="mdi-cog" class="settings-icon"/>
      </router-link>

      <q-avatar class="profile-pic">
        <img src="https://cdn.quasar.dev/img/boy-avatar.png">
      </q-avatar>
      <div class="text-h5 text-white profile-name">
        {{ username }}
      </div>
    </div>

    <!-- People list -->
    <div
      v-if="ready"
      class="flex row profile-user-container"
    >
      <div
        v-for="person in people"
        :key="person.id"
        class="flex flex-center profile-user">
        <div
          class="flex flex-center profile-username-container"
          v-bind:style="{ 'background-color': person.colour }"
        >
          {{person.name}}
        </div>
      </div>
    </div>

    <!-- Photos -->
    <div class="flex row justify-between photos">
      <div
        class="flex column align-center justify-end photo-container"
        v-for="post in posts"
        :key="post.id">
        <q-img
          class="photo"
          style="max-height: 200px;"
          fit="contain"
          :src='post.imageUrl'
        />
        <div class="flex flex-center photo-date">
          {{ niceDate(post.date) }}
        </div>
      </div>
    </div>

    <q-btn
      unelevated
      rounded
      color="red"
      icon="mdi-logout"
      label="LOGOUT"
      size="lg"
      @click="logout"
      class="logout"
    />
  </q-page>
</template>

<style lang="scss">
.profile-container {
  margin-top: 60px;
  margin-bottom: 20px;
  width: 100%;
  height: 250px;
  background-color: $secondary;
}
.settings-icon {
  font-size: 8vw;
  position: absolute;
  top: 120px;
  right: 8%;
}
.profile-pic {
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
}
.profile-user-container {
  width: 100%;
  margin-bottom: 10px;
}
.profile-user {
  width: 21%;
  height: 30px;
  margin-top: 15px;
  margin-left: 2%;
  margin-right: 2%;
}
.profile-username-container {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  font-size: 14px;
  color: white;
}
.photos {
  width: 90%;
  margin-bottom: 80px;
}
.photo-container {
  width: 48%;
  margin-bottom: 10px;
  border-radius: 10px;
}
q-img {
  width: 100%;
  max-height: 3px;
}
.photo-date {
  background-color: white;
  border-width: 1px;
  border-color: darkgrey;
  border-style: solid;
  width: 100%;
  padding: 10px;
  font-size: 18px;
  border-end-end-radius: 10px;
  border-end-start-radius: 10px;
}
a.profile-link {
  color: white;
  text-decoration: none;
}
.logout {
  margin-bottom: 150px;
}
</style>

<script>
import { date } from 'quasar'
export default {
  name: 'profile',
  data () {
    return {
      ready: true,
      people: [],
      posts: []
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
    },
    userid: {
      get () {
        return this.$store.state.user.userid
      }
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
    getPosts () {
      this.$axios.get(`${process.env.API}/posts`).then((response) => {
        this.posts = response.data
        this.posts = this.posts.filter(post => post.author === this.username)
      }).catch(() => {
        this.$q.dialog({
          title: 'Error',
          message: 'Could not download posts'
        })
      })
    },
    logout: function () {
      this.$store.commit('user/logout')
      this.$router.push({ name: 'home' })
    }
  },
  created () {
    this.getPeople()
    this.getPosts()
  }
}
</script>

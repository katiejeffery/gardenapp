<template>
  <q-page padding class="flex column homepage">
    <!-- Header -->
    <div class="header fixed-top">
      <q-icon size="lg" name="mdi-arrow-left" @click="$router.go(-1)" style="position:absolute;left:20px;"/>
      Home
    </div>

    <!-- Plants -->
    <div class="scroll-container">
      <div class="row section-title">
        <p> <q-icon name="mdi-sprout-outline" /> My Garden </p>
      </div>
      <!-- If Garden Empty -->
      <div
        v-if="!garden.length"
        class="index-empty">
        Go to 'Garden' tab to get started!
      </div>

      <!-- Plant Scroll -->
      <q-scroll-area class="card-container">
        <div
          class="plants-scroll">
          <div
            v-for="plant in garden"
            :key = "plant.id">
            <router-link
              :to="{ name: 'plantinfo', params: {id:plant.plantedId} }"
              class="home-link">
              <q-card class="my-card">
                <img class="index-plant-image" :src="plant.image">

                <q-card-section class="flex row justify-around index-plant-info">
                  <q-img
                    class="indexplant-icon"
                    :src="plant.icon"
                    spinner-color="white"
                  />
                  <div class="flex column flex-center">
                    <div class="card-caption">{{ plant.name }}</div>
                    <div class="text-subtitle2">Planted on </div>
                    <div class="text-subtitle2 planted-date">{{ niceDate(plant.datePlanted) }}</div>
                  </div>
                </q-card-section>

              </q-card>
            </router-link>
          </div>
        </div>
      </q-scroll-area>
    </div>

    <!-- Social -->
    <div class="scroll-container">
      <div class="section-title">
        <p> <q-icon name="mdi-account-group-outline" /> Social </p>
      </div>
      <!-- If Social Empty -->
      <div
        v-if="!posts.length"
        class="index-empty">
        Go to 'Social' tab to get started!
      </div>
      <q-scroll-area class="card-container">

        <div class="plants-scroll">
          <div v-for="post in posts" :key="post.id">
            <q-card class="my-card">
              <q-img
                fit="scale-down"
                style="height: 165px;"
                :src="post.imageUrl"
              />

              <q-card-section class="caption-container">
                <div class="social-caption">{{post.caption}}</div>
                <div class="text-subtitle1">{{ niceDate(post.date) }}</div>
              </q-card-section>
            </q-card>
          </div>

        </div>
      </q-scroll-area>
    </div>

  </q-page>
</template>

<style lang="scss">
.homepage {
  padding-top: 70px;
  padding-bottom: 100px;
}
.home-link {
  width: 100%;
}
p {
  margin: 0;
  padding: 0;
}
a {
  color: black;
  text-decoration: none;
}

.scroll-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 340px;
  background-color: rgba($primary, 0.6);
  color: white;
  font-weight: bold;
  font-size: 25px;
  margin: 10px -20px 10px 0;
  padding: 10px 0 0 20px;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
}
.section-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: 5px;
}
.card-container{
  height: 280px;
  margin-left: -3px;
  padding: 0;
  display: flex;
  flex-direction: row;
}
.plants-scroll {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.my-card {
  width: 220px;
  height: 260px;
  margin: 5px;
  border-radius: 10px;
  color: black;
}
.index-plant-image {
  max-height: 150px;
  object-fit: cover;
}
.index-plant-info {
  padding: 10px;
}
.indexplant-icon {
  height: 50px;
  max-width: 50px;
}
.caption-container {
  padding: 5px;
  padding-left: 10px;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.card-caption {
  font-size: 25px;
}
.planted-date {
  font-size: 18px;
}
.social-caption {
  font-size: 20px;
}
</style>

<script>
import { date } from 'quasar'

export default {
  name: 'mygarden',
  data () {
    return {
      garden: [],
      allplants: [],
      posts: []
    }
  },
  methods: {
    getPlants () {
      this.$axios.get(`${process.env.API}/garden`).then((response) => {
        this.garden = response.data
        this.garden = this.garden.filter(plant => plant.user === this.username)
      }).catch(() => {
        this.$q.dialog({
          title: 'Error',
          message: 'Could not download garden'
        })
      })
    },
    getAllPlants () {
      this.$axios.get(`${process.env.API}/allplants`).then((response) => {
        this.allplants = response.data
      }).catch(() => {
        this.$q.dialog({
          title: 'Error',
          message: 'Could not download plants'
        })
      })
    },
    getPosts () {
      this.$axios.get(`${process.env.API}/posts`).then((response) => {
        this.posts = response.data
      }).catch(() => {
        this.$q.dialog({
          title: 'Error',
          message: 'Could not download posts'
        })
      })
    }
  },
  computed: {
    niceDate () {
      return (v) => {
        return date.formatDate(v, 'Do MMMM')
      }
    },
    username: {
      get () {
        return this.$store.state.user.username
      }
    }
  },
  created () {
    this.getPlants()
    this.getAllPlants()
    this.getPosts()
  }
}
</script>

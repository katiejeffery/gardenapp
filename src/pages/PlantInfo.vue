<template>
  <q-page padding class="flex items-center column page">
    <!-- Header -->
    <div class="header fixed-top">
      <q-icon size="lg" name="mdi-arrow-left" @click="$router.go(-1)" style="position:absolute;left:20px;"/>
      Plant Info
    </div>

    <!-- Plant Title -->
    <div class="plant-pic">

      <q-img
        class="plant-pic-img"
        style="max-height: 300px; z-index: -1; object-fit: cover;"
        :src="gardeninfo.image"
        />
      <div class="flex row flex-center pic-title">
        <q-img
          class="plantinfo-icon"
          :src="gardeninfo.icon"
          spinner-color="white"
        />
        {{gardeninfo.name}}
      </div>

    </div>

    <!-- Plant Info -->
    <div class="plantinfo-info">
      Planted on {{ niceDate(gardeninfo.datePlanted) }} <br/>
      {{ timeDifference(gardeninfo.datePlanted) === 'planted today!' ? 'They were ' : 'They are ' }}
      {{ timeDifference(gardeninfo.datePlanted) }}
    </div>

    <q-icon
      class="tap-icon"
      name="mdi-gesture-tap"
      size="xl"
      color="white"
    />
    <!-- Fun Fact - NOT CLICKED -->
    <div
      v-if="!factClicked"
      class="interaction"
      @click="factMethod()"
    >
      FUN FACT
    </div>

    <!-- Fun Fact - CLICKED -->
    <div
      v-else
      class="interaction"
      @click="factMethod()"
    >
      <div class="interaction-inside">
        {{ plantinfo.fact }}
      </div>
    </div>

    <q-icon
      class="tap-icon"
      name="mdi-gesture-tap"
      size="xl"
      color="white"
    />
    <!-- Fruit Quiz - NOT CLICKED -->
    <div
      v-if="!quizClicked"
      class="interaction"
      @click="quizMethod()"
    >
      <div class="interaction-inside">
        FRUIT or VEGETABLE?
      </div>
    </div>

    <!-- Fruit Quiz - CLICKED FRUIT -->
    <div
      v-else-if="plantinfo.quiz == 'Fruit!'"
      class="interaction fruit"
      @click="quizMethod()"
    >
      {{ plantinfo.quiz }}
    </div>

    <!-- Fruit Quiz - CLICKED VEGETABLE -->
    <div
      v-else
      class="interaction vege"
      @click="quizMethod()"
    >
      {{ plantinfo.quiz }}
    </div>

    <!-- Camera Button -->
    <div class="take-photo">
      Take a photo!
      <router-link
        :to="{ name: 'camera', params: {origin:plantedID} }"
      >
        <q-btn
          class="photo-button"
          round color="secondary"
          icon="photo_camera"
          size="xl"
        />
      </router-link>
    </div>

    <!-- Photo Timeline -->
    <div class="album">
      Photo Timeline
      <q-scroll-area class="album-scroll">
        <div class="scroll-content">

          <q-card
            v-for="picture in timeline"
            :key="picture.id"
            class="plant-card q-mb-md"
            flat
            bordered
          >
            <img class="info-plant-img" :src='picture.imageUrl'>

            <q-card-section class="flex row justify-around card-inside">
              {{ timeDifference(picture.date) }}
              <!-- Timeline Delete Button -->
              <div class="delete-container">
                <q-btn
                  class="cross-button"
                  unelevated
                  round
                  color="red"
                  icon="mdi-trash-can"
                  size="sm"
                  @click="timelineDeletePrompt=true"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Timeline Delete Dialog -->
          <q-dialog v-model="timelineDeletePrompt">
            <q-card style="min-width: 350px">
              <q-card-section>
                <div class="text-h6">Are you sure you want to delete this picture?</div>
              </q-card-section>

              <q-card-actions align="right" class="flex row justify-around text-primary">
                <q-btn color="red" label="Delete Post" v-close-popup @click="deletePicture()"/>
                <q-btn color="primary" label="Cancel" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

        </div>
      </q-scroll-area>
    </div>

    <!-- Delete -->
    <q-btn
      color="red"
      label="Remove Plant"
      v-close-popup
      @click="deletePrompt=true"/>

    <!-- Delete Dialog -->
    <q-dialog v-model="deletePrompt">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Are you sure you want to remove this plant from your garden?</div>
        </q-card-section>

        <q-card-actions align="right" class="flex row justify-around text-primary">
          <q-btn color="red" label="Remove Plant" v-close-popup @click="deletePlant()"/>
          <q-btn color="primary" label="Cancel" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<style lang="scss">
.plant-pic {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
}
.plant-pic-img {
  border-radius: 20px;
}
.plantinfo-icon {
  margin-right: 5px;
  height: 45px;
  max-width: 45px;
}
.pic-title {
  background-color: #C6EAC2;
  min-width: 70%;
  height: 70px;
  margin-top: -30px;
  font-size: 32px;
  border-radius: 25px;
  color: $primary;
  font-weight: bold;
  box-shadow: 3px 3px 3px lightgray;
}
.plantinfo-info {
  color: $primary;
  margin: 15px 0 40px 0;
  font-size: 26px;
  text-align: center;
  line-height: 2;
}
.interaction {
  background-color: $primary;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  width: 80%;
  margin: 10px;
  margin-bottom: 30px;
  min-height: 100px;
  border-radius: 20px;
  font-size: 24px;
}
.interaction-inside {
  width: 70%;
  text-align: center;
}
.fruit {
  background-color: maroon;
}
.vege {
  background-color: darkgreen;
}
.tap-icon {
  margin-bottom: -70px;
  margin-right:-70%;
}
.bold {
  font-weight: bold;
  font-size: 20px;
}
.take-photo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 22px;
  margin: 10px 0 10px 0;
  font-weight: bold;
}
.album {
  width: 90%;
  height: 250px;
  font-size: 25px;
  font-weight: bold;
  color: $primary;
  margin-bottom: 60px;
}
.album-scroll {
  width: 100%;
  height: 240px;
  border-style: solid;
  border-width: 1.8px;
  border-color: $primary;
  border-radius: 10px;
  padding: 5px;
}
.scroll-content {
  height: 145px;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.plant-card {
  width: 220px;
  height: 280px;
  margin: 5px;
}
.info-plant-img {
  height: 200px;
}
.card-inside {
  height: 50px;
  padding: 5px 0 0 5px;
  font-size: 22px;
  font-weight: 400;
  text-align: center;
}
a {
  text-decoration: none;
}
</style>

<script>
require('md-gum-polyfill')
import { date } from 'quasar'

export default {
  name: 'plantinfo',
  data () {
    return {
      plantedID: null,
      gardeninfo: {
        datePlanted: null,
        plantId: null,
        plantedID: null
      },
      plantinfo: {
        icon: null,
        id: null,
        name: null,
        quiz: null,
        fact: null
      },
      factClicked: false,
      quizClicked: false,
      timeline: [],
      timelineDeletePrompt: false,
      deletePrompt: false,
      selectedPicture: ''
    }
  },

  methods: {
    getInfo () {
      this.$axios.get(`${process.env.API}/plantedinfo`, { params: { plantId: this.plantedID } }).then((response) => {
        this.gardeninfo = response.data
        this.$axios.get(`${process.env.API}/plantinfo`, { params: { plantId: this.gardeninfo.plantId } }).then((response) => {
          this.plantinfo = response.data
          console.log(this.plantinfo)
        }).catch(() => {
          this.$q.dialog({
            title: 'Error',
            message: 'Could not download posts'
          })
        })
      }).catch(() => {
        this.$q.dialog({
          title: 'Error',
          message: 'Could not download posts'
        })
      })
    },
    factMethod () {
      this.factClicked = !this.factClicked
    },
    quizMethod () {
      this.quizClicked = !this.quizClicked
    },
    getTimeline () {
      this.$axios.get(`${process.env.API}/timeline`, { params: { plantedId: this.plantedID } }).then((response) => {
        this.timeline = response.data
      }).catch(() => {
        this.$q.dialog({
          title: 'Error',
          message: 'Could not download posts'
        })
      })
    },
    deletePicture () {
      const formData = new FormData()
      formData.append('pictureid', this.selectedPicture)
      formData.append('plantid', this.plantedID)

      this.$axios.post(`${process.env.API}/deletepicture`, formData).then(
        response => {
          console.log('response: ', response)
          window.location.reload(false)
        }).catch(err => {
        console.log('err: ', err)
      })
      window.location.reload(false)
    },
    deletePlant () {
      const formData = new FormData()
      formData.append('plantid', this.plantedID)

      this.$axios.post(`${process.env.API}/deleteplant`, formData).then(
        response => {
          console.log('response: ', response)
        }).catch(err => {
        console.log('err: ', err)
      })
      this.$router.push({ name: 'mygarden' })
    }
  },
  computed: {
    niceDate () {
      return (v) => {
        return date.formatDate(v, 'dddd Do MMMM')
      }
    },
    timeDifference () {
      return (v) => {
        let diffString = ''
        const timeNow = new Date()
        const difference = date.getDateDiff(timeNow, v, 'days')
        if (difference === 0) {
          diffString = 'planted today!'
        } else {
          // 0 days
          if ((difference % 7) === 0) {
            // 1 week
            if (Math.floor(difference / 7) === 1) {
              diffString = Math.floor(difference / 7) + ' week old.'
            // > 1 week
            } else {
              diffString = Math.floor(difference / 7) + ' weeks old.'
            }
          // 0 weeks old
          } else if (Math.floor(difference / 7) === 0) {
            // 1 day
            if ((difference % 7) === 1) {
              diffString = difference + ' day old.'
            // > 1 day
            } else {
              diffString = difference + ' days old.'
            }
          } else {
            // 1 week
            if (Math.floor(difference / 7) === 1) {
              // 1 week 1 day
              if ((difference % 7) === 1) {
                diffString = Math.floor(difference / 7) + ' week and ' + difference % 7 + ' day old.'
              // 1 week > 1 day
              } else {
                diffString = Math.floor(difference / 7) + ' week and ' + difference % 7 + ' days old.'
              }
            // > 1 week 1 day
            } else if ((difference % 7) === 1) {
              diffString = Math.floor(difference / 7) + ' weeks and ' + difference % 7 + ' day old.'
            } else {
              diffString = Math.floor(difference / 7) + ' weeks and ' + difference % 7 + ' days old.'
            }
          }
        }
        return diffString
      }
    }
  },
  created () {
    this.plantedID = this.$route.params.id
    this.getInfo()
    this.getTimeline()
  }
}
</script>

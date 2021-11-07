<template>
  <q-page padding class="flex column page">
    <!-- Header -->
    <div class="header fixed-top">
      <q-icon size="lg" name="mdi-arrow-left" @click="$router.go(-1)" style="position:absolute;left:20px;"/>
      My Garden
    </div>

    <div class="garden-body column flex flex-center">
      <router-link
        to='addplant'
        class='garden-link'
        >
        <q-btn
          rounded
          color="primary"
          icon="mdi-plus"
          label="Add Plant"
          size="lg"
        />
      </router-link>

      <!-- If Garden Empty -->
      <div
        v-if="!garden.length"
        class="garden-empty">
        There are no plants in your garden. <br/> Tap 'ADD PLANT' to get started!
      </div>
      <!-- Plant Card -->
      <div
        class="flex column flex-center for-container"
        v-for="plant in garden"
        :key = "plant.id">
        <div class="plant-container">
          <q-img
            class="gardenplant-icon"
            :src="plant.icon"
            spinner-color="white"
          />

          <router-link
            :to="{ name: 'plantinfo', params: {id:plant.plantedId} }"
            class="garden-link">
            <div z-max class="pic">
            </div>
            <q-card class="my-cardd">
              <q-card-section horizontal>

                <q-img
                  class="card-image"
                  :src="plant.image"
                />

                <q-card-section class="plant-info">
                  <b> {{plant.name}} </b>
                  <div class="date-planted">
                    Planted on: <br/>
                    <b>{{niceDate(plant.datePlanted)}}</b>
                  </div>
                  <div class="time-planted">
                    <b> {{ timeDifference(plant.datePlanted) }} </b>
                  </div>
                </q-card-section>
              </q-card-section>
            </q-card>
          </router-link>
        </div>
      </div>
    </div>

  </q-page>
</template>

<style lang="scss">
.for-container {
  width: 100%;
  height: 250px;
}
.plant-container {
  width: 85%;
  // max-width: 350px;
}
.gardenplant-icon {
  margin-bottom: -90px;
  margin-left: 10px;
  height: 45px;
  max-width: 45px;
}
.my-cardd {
  width: 100%;
  padding: 10px;
  z-index: -100;
  background-color: #EEF8ED;
  border-radius: 25px;
}
.card-image {
  max-height: 200px;
  width: 45%;
}
.plant-info {
  padding: 0 10px 0 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  font-size: 26px;
}
.pic {
  background-color: #EEF8ED;
  margin-bottom: -70px;
  width: 65px;
  height: 70px;
  border-end-end-radius: 30px;
  border-top-left-radius: 25px;
}
.date-planted {
  font-size: 22px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.time-planted {
  color: $primary;
  position: bottom;
  font-size: 22px;
}
a {
  text-decoration: none;
}
a.garden-link {
  color: black;
}
.garden-empty {
  text-align: center;
  color: gray;
  padding: 30px;
  font-size: 28px;
}
</style>

<script>
import { date } from 'quasar'

export default {
  name: 'mygarden',
  data () {
    return {
      garden: []
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
    }
  },
  computed: {
    niceDate () {
      return (v) => {
        return date.formatDate(v, 'Do MMMM')
      }
    },
    timeDifference () {
      return (v) => {
        let diffString = ''
        const timeNow = new Date()
        const difference = date.getDateDiff(timeNow, v, 'days')
        if (difference === 0) {
          diffString = 'Planted Today!'
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
    },
    username: {
      get () {
        return this.$store.state.user.username
      }
    }
  },
  created () {
    this.getPlants()
  }
}
</script>

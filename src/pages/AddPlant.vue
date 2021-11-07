<template>
  <q-page padding class="flex flex-center column">
    <!-- Header -->
    <div class="header fixed-top">
      <q-icon size="lg" name="mdi-arrow-left" @click="$router.go(-1)" style="position:absolute;left:20px;"/>
      Add Plant
    </div>
    <div class="text-h6 desc">
      Add a plant to your garden!
    </div>

    <!-- Select Plant -->
    <div
      class="flex column flex-center list-container"
      v-if="selectedId===''"
      >
      <div class="text-h4">
        Select a plant:
      </div>
      <div
        class="flex column flex-center plant-list"
        v-for="plant in plants"
        :key="plant.id"
        @click="selectedPlantName=plant.name;selectedIcon=plant.icon;selectedId=plant.id;selectedImage=plant.image"
        >
        <q-img
          class="add-icon"
          :src="plant.icon"
          spinner-color="white"
        />
        {{ plant.name }}
      </div>

      <!-- Other Plant -->
      <div
        class="flex column flex-center plant-list"
        @click="selectedIcon='https://firebasestorage.googleapis.com/v0/b/gardenapp-b5097.appspot.com/o/plant.png?alt=media&token=dafc6cc3-922a-4cb8-b9e3-2426bf28f5d6';selectedId='NA';"
        >
        <q-img
          class="add-icon"
          src="https://firebasestorage.googleapis.com/v0/b/gardenapp-b5097.appspot.com/o/plant.png?alt=media&token=dafc6cc3-922a-4cb8-b9e3-2426bf28f5d6"
          spinner-color="white"
        />
        Other
      </div>
    </div>

    <!-- Confirm Plant -->
    <div
      class="flex column flex-center confirm"
      v-else-if="selectedId!='NA'"
      >
      Are you sure you want to add
      <div class="selected-plant">
        <q-img
          :src="selectedIcon"
          spinner-color="white"
        />
        <b>{{ selectedPlantName }}</b>
      </div>
      to your garden?
      <div class="flex row justify-around confirm-options">
        <div
          class="flex flex-center confirm-button"
          @click="selectedPlantName='';selectedId=''"
          >
          No
        </div>
        <div
          class="flex flex-center confirm-button"
          @click="addPlant()"
          >
          Yes
        </div>
      </div>
    </div>

    <!-- Confirm Other Plant -->
    <div
      class="flex column flex-center confirm"
      v-else>
      <q-img
        :src="selectedIcon"
        spinner-color="white"
        class="other-plant"
      />
      What is the name of the plant?
      <q-input class="name-input" standout="bg-primary text-white" v-model="selectedPlantName" label="Plant Name" />
      <!-- Select Photo -->
      Choose a photo (optional)
      <q-file
        v-model="selectedImage"
        @input="captureImageFallback"
        outlined
        label="Choose an image"
        accept="image/*"
      >
        <template v-slot:prepend>
          <q-icon name="mdi-paperclip" />
        </template>
      </q-file>

      <!-- Cancel/Add Buttons -->
      <div class="flex row justify-around confirm-options">
        <div
          class="flex flex-center confirm-button"
          @click="selectedPlantName='';selectedId=''"
          >
          Cancel
        </div>
        <div
          class="flex flex-center confirm-button"
          @click="addPlant()"
          >
          Add
        </div>
      </div>
    </div>

  </q-page>
</template>

<style lang="scss">
.list-container {
  width: 100%;
  margin-bottom: 100px;
}
.desc {
  margin-bottom: 30px;
}
.plant-list {
  width: 80%;
  height: 50px;
  font-size: 30px;
  color: white;
  border-radius: 10px;
  background-color: $secondary;
  margin: 15px;
}
.add-icon {
  position: absolute;
  margin-left: -65%;
  height: 35px;
  max-width: 35px;
}
.confirm {
  font-size: 30px;
  width: 80%;
  text-align: center;
}
.confirm-options {
  width: 100%;
}
.confirm-button {
  color: white;
  background-color: $secondary;
  min-width: 20%;
  margin-top: 20px;
  border-radius: 10px;
  padding-right: 10px;
  padding-left: 10px;
}
.name-input {
  width: 60%;
  font-size: 26px;
  margin: 15px;
}
.other-plant {
  max-width: 20%;
  object-fit: cover;
}
</style>

<script>
import { uid } from 'quasar'
export default {
  name: 'addplant',
  data () {
    return {
      plants: [],
      selectedPlantName: '',
      selectedIcon: '',
      selectedId: '',
      selectedImage: ''
    }
  },
  methods: {
    getPlants () {
      this.$axios.get(`${process.env.API}/plants`).then((response) => {
        this.plants = response.data
      }).catch(() => {
        this.$q.dialog({
          title: 'Error',
          message: 'Could not download posts'
        })
      })
    },
    addPlant () {
      const formData = new FormData()
      formData.append('plantId', this.selectedId)
      formData.append('icon', this.selectedIcon)
      formData.append('name', this.selectedPlantName)
      console.log('image: ' + this.selectedImage)
      formData.append('image', this.selectedImage)
      formData.append('date', Date.now())
      formData.append('plantedId', uid())
      formData.append('user', this.username)

      this.$axios.post(`${process.env.API}/addplant`, formData).then(
        response => {
          console.log('response: ', response)
        }).catch(err => {
        console.log('err: ', err)
      })

      this.$router.push('mygarden')
    },
    captureImageFallback (file) {
      this.selectedImage = file
    }
  },
  created () {
    this.getPlants()
  },
  computed: {
    username: {
      get () {
        return this.$store.state.user.username
      }
    }
  }
}
</script>

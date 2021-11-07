<template>
  <q-page padding class="flex column">
    <!-- Header -->
    <div class="header fixed-top">
      <q-icon size="lg" name="mdi-arrow-left" @click="$router.go(-1)" style="position:absolute;left:20px;"/>
      Settings
    </div>

    <!-- USERNAME -->
    <div
      v-if="!ready"
      class="flex flex-center column setting-container top">
      <!-- picture -->
      <q-img src="https://cdn.quasar.dev/img/boy-avatar.png" class="profile-pic"/>
      <!-- choose new picture -->
      Choose a new picture:
      <q-file
        v-model="selectedImage"
        @input="captureImageFallback"
        outlined
        label="Choose an image"
        accept="image/*"
        class="picture-select"
      >
        <template v-slot:prepend>
          <q-icon name="mdi-paperclip" />
        </template>
      </q-file>
      <!-- name -->
      <q-input color="primary" v-model="text" label="Username">
        <template v-slot:prepend>
          <q-icon name="mdi-pencil" />
        </template>
      </q-input>
    </div>

    <!-- PEOPLE LIST -->
    <div
      v-if="ready"
      class="flex column flex-center setting-container bottom"
    >
      PEOPLE LIST
      <!-- Add Person -->
      <div
        class="flex row flex-center add"
        style="background-color: grey"
        @click="addPersonPrompt=true;"
      >
        + ADD
      </div>
      <div
        v-for="person in people"
        :key="person.id"
        class="flex row flex-center users">
        <!-- Pick Colour -->
        <div
          v-bind:style="{ 'background-color': person.colour }"
          class="flex flex-center username-container color-icon"
          @click="colourPrompt=true; selectedName = person.name">
          <q-icon name="mdi-palette" class="settings-colour"/>
        </div>

        <!-- Name -->
        <div
          class="flex flex-center username-container"
          v-bind:style="{ 'background-color': person.colour }"
        >
          <!-- edit -->
          <q-icon name="mdi-pencil" class="settings-edit" @click="namePrompt=true; selectedId=person.id;"/>
          <!-- name -->
          {{person.name}}
        </div>
        <!-- Remove -->
        <q-icon name="mdi-close-circle" class="settings-remove" @click="selectedId=person.id; deleteperson()"/>

        <!-- Colour Dialog -->
        <q-dialog v-model="colourPrompt">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Change Colour</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-color
                v-model="selectedColour"
                :default-value="person.colour"
                @keyup.enter="colourPrompt = false"
              />
            </q-card-section>

            <q-card-actions align="right" class="text-primary">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn flat label="Confirm" v-close-popup @click="changeColour()"/>
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Name Dialog -->
        <q-dialog v-model="namePrompt">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Change Name</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-input dense v-model="newName" autofocus @keyup.enter="namePrompt = false" />
            </q-card-section>

            <q-card-actions align="right" class="text-primary">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn flat label="Confirm" v-close-popup @click="changeName()"/>
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>

      <!-- Add Person Dialog -->
      <q-dialog v-model="addPersonPrompt">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Person's Name</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="addName" autofocus @keyup.enter="namePrompt = false" />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn flat label="Add" v-close-popup @click="addPerson()"/>
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>

  </q-page>
</template>

<style lang="scss">
.top {
  margin-top: 60px;
}
.profile-pic {
  width: 20%;
}
.profile-container {
  margin-top: 60px;
  width: 100%;
  height: 250px;
  background-color: $secondary;
}
.profile-pic {
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
}
.setting-container {
  width: 100%;
  padding-top: 3%;
  padding-bottom: 5%;
  margin-bottom: 10px;
  background-color:gainsboro;
  border-radius: 10px;
  font-size: x-large;
}
.bottom {
  margin-top: 100px;
  margin-bottom: 100px;
}
.add {
  margin-top: 15px;
  margin-left: 15%;
  width: 60%;
  height: 45px;
  border-radius: 10px;
  font-size: large;
  color: white;
}
.users {
  width: 100%;
  height: 45px;
  margin-top: 15px;
  margin-left: 2%;
  margin-right: 2%;
  color: black;
  font-size: 150%;
}
.username-container {
  width: 60%;
  height: 100%;
  border-radius: 10px;
  font-size: 14px;
  color: white;
  margin-right: 2%;
  font-size: large;
}
.settings-username-edit {
  font-size: x-large;
}
.settings-edit {
  font-size: x-large;
  position: absolute;
  left: 35%;
}
.color-icon {
  width: 20%;
  font-size: xx-large;
}
.remove {
  width: 30%;
}
.picture-select {
  margin-bottom: 50px;
}
</style>

<script>
import { uid } from 'quasar'

export default {
  name: 'settings',
  data () {
    return {
      ready: true,
      people: [],
      text: 'Endeavor',
      namePrompt: false,
      colourPrompt: false,
      addPersonPrompt: false,
      selectedColour: '',
      selectedName: '',
      selectedId: '',
      newName: '',
      addName: ''
    }
  },
  methods: {
    getPeople () {
      console.log('userid: ' + this.userid)
      this.$axios.get(`${process.env.API}/people`, { params: { userid: this.userid } }).then((response) => {
        this.people = response.data
      }).catch(() => {
        this.$q.dialog({
          title: 'Error',
          message: 'Could not download people'
        })
      })
    },
    changeColour () {
      const formData = new FormData()
      formData.append('name', this.selectedName)
      formData.append('colour', this.selectedColour)

      this.$axios.post(`${process.env.API}/personcolour`, formData).then(
        response => {
          console.log('response: ', response)
        }).catch(err => {
        console.log('err: ', err)
      })
      window.location.reload(false)
    },
    changeName () {
      const formData = new FormData()
      formData.append('userid', this.userid)
      formData.append('id', this.selectedId)
      formData.append('newname', this.newName)

      this.$axios.post(`${process.env.API}/personname`, formData).then(
        response => {
          console.log('response: ', response)
        }).catch(err => {
        console.log('err: ', err)
      })
      window.location.reload(false)
    },
    captureImageFallback (file) {
      this.selectedImage = file
    },
    deleteperson () {
      const formData = new FormData()
      formData.append('userid', this.userid)
      formData.append('personid', this.selectedId)

      this.$axios.post(`${process.env.API}/deleteperson`, formData).then(
        response => {
          console.log('response: ', response)
          window.location.reload(false)
        }).catch(err => {
        console.log('err: ', err)
      })
      window.location.reload(false)
    },
    addPerson () {
      const formData = new FormData()
      formData.append('userid', this.userid)
      formData.append('name', this.addName)
      formData.append('id', uid())

      this.$axios.post(`${process.env.API}/addperson`, formData).then(
        response => {
          console.log('response: ', response)
        }).catch(err => {
        console.log('err: ', err)
      })
      window.location.reload(false)
    }
  },
  computed: {
    userid: {
      get () {
        return this.$store.state.user.userid
      }
    }
  },
  created () {
    this.getPeople()
  }
}
</script>

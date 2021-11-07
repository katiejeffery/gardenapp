<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>

      <!-- Contents -->
      <router-view
        v-if="username != ''"
        />

      <!-- Menu -->
      <div class="fixed-bottom gradient">
      </div>

      <q-tabs
        class="fixed-bottom bg-primary tabs"
        dense
        align="justify"
        v-if="username != ''"
      >
        <q-route-tab
          class="tab"
          name="mygarden"
          label="Garden"
          to="/mygarden"
          icon="mdi-leaf"
          no-caps
        />
        <q-route-tab
          class="tab"
          name="calendar"
          label="Calendar"
          to="/calendar"
          icon="mdi-calendar"
          no-caps
        />
        <q-route-tab
          class="tab"
          name="home"
          label="Home"
          icon="mdi-home"
          to="/"
          size="xl"
        />
        <q-route-tab
          class="tab"
          name="social"
          label="Social"
          to="/social"
          icon="mdi-account-group"
          no-caps
        />
        <q-route-tab
          class="tab"
          name="profile"
          label="Profile"
          to="/profile"
          icon="mdi-account"
          no-caps
        />
      </q-tabs>

      <div
        v-else
        class="flex flex-center column users-container"
      >
        Select your user:
        <div
          v-for="user in userlist"
          :key="user.id"
          class="flex flex-center user-container"
        >
          <div
            @click="selectUser(user.name, user.id)">
            {{ user.name }}
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">
.gradient {
  width: 100%;
  height: 100px;
  background: linear-gradient(rgba( white, 0 ), rgba( $primary, 0.6 ));
}
.tabs {
  height: 70px;
}
.tab {
  padding: 0;
  color: white;
}
a:link.tab {
  text-decoration: none;
  color: white;
}
.users-container {
  font-size: 25px;
  margin-top: 50px;
  width: 100%;
}
.user-container {
  width: 80%;
  height: 100px;
  background-color: $primary;
  margin: 10px;
  color: white;
  font-size: 30px;
  border-radius: 20px;
}
</style>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MainLayout',
  data () {
    return {
      userlist: []
    }
  },
  methods: {
    getUsers () {
      this.$axios.get(`${process.env.API}/users`).then((response) => {
        this.userlist = response.data
        console.log(this.plantinfo)
      }).catch(() => {
        this.$q.dialog({
          title: 'Error',
          message: 'Could not download posts'
        })
      })
    },
    selectUser (name, id) {
      console.log('id: ' + id)
      this.$store.commit('user/selectUser', name)
      this.$store.commit('user/selectId', id)
    }
  },
  computed: {
    username: {
      get () {
        return this.$store.state.user.username
      }
    }
  },
  created () {
    this.getUsers()
  }
})
</script>

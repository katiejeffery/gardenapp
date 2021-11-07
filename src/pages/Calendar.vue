<template>
  <q-page padding class="flex flex-center column page">
    <!-- Header -->
    <div class="header fixed-top">
      <q-icon size="lg" name="mdi-arrow-left" @click="$router.go(-1)" style="position:absolute;left:20px;"/>
      Calendar
    </div>

    This feature is still under construction.
    <div
      :v-if="ready===true">
      <q-calendar-month
        ref="calendar"
        v-model="selectedDate"
        month-label-size="lg"
        date-align="center"
        :day-min-height="80"
        animated
        bordered
      >
        <template #day="{ scope: { timestamp } }">
            <template
              v-for="event in eventsMap[timestamp.date]"
              :key="event.id"
            >
              <div
                :class="badgeClasses(event, 'day')"
                :style="badgeStyles(event, 'day')"
                class="my-event"
              >
                <div class="title q-calendar__ellipsis">
                  {{ event.title }}
                </div>
                <q-img
                  class="plant-icon"
                  src="https://firebasestorage.googleapis.com/v0/b/gardenapp-b5097.appspot.com/o/238421002_3053078771637815_6087365435877714895_n.png?alt=media&token=97500d69-33a6-481c-b729-47652ae526c4"
                />
              </div>
            </template>
          </template>
      </q-calendar-month>
    </div>

  </q-page>
</template>

<style lang="scss">
</style>

<script>
import { date } from 'quasar'
import {
  addToDate,
  parseTimestamp,
  parseDate,
  today
} from '@quasar/quasar-ui-qcalendar/src/index.js'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarMonth.sass'

const CURRENT_DAY = new Date()
function getCurrentDay (day) {
  const newDay = new Date(CURRENT_DAY)
  newDay.setDate(day)
  const tm = parseDate(newDay)
  // 2021-09-01
  return tm.date
}

export default {
  name: 'calendar',
  data () {
    return {
      ready: false,
      posts: [],
      selectedDate: today(),
      dateType: 'rounded',
      events: [
        {
          id: 1,
          title: '1st of the Month',
          date: getCurrentDay(1)
        }
      ]
    }
  },
  methods: {
    onToday () {
      this.$refs.calendar.moveToToday()
    },
    onPrev () {
      this.$refs.calendar.prev()
    },
    onNext () {
      this.$refs.calendar.next()
    },
    badgeClasses (event, type) {
      return {
        'rounded-border': true
      }
    },
    badgeStyles (day, event) {
      const s = {}
      // s.left = day.weekday === 0 ? 0 : (day.weekday * this.parsedCellWidth) + '%'
      // s.top = 0
      // s.bottom = 0
      // s.width = (event.days * this.parsedCellWidth) + '%'
      return s
    },
    onMoved (data) {
      console.log('onMoved', data)
    },
    onChange (data) {
      console.log('onChange', data)
    },
    onClickDate (data) {
      console.log('onClickDate', data)
    },
    onClickDay (data) {
      console.log('onClickDay', data)
    },
    onClickWorkweek (data) {
      console.log('onClickWorkweek', data)
    },
    onClickHeadDay (data) {
      console.log('onClickHeadDay', data)
    },
    onClickHeadWorkweek (data) {
      console.log('onClickHeadWorkweek', data)
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
    eventsMap () {
      const map = {}
      if (this.events.length > 0) {
        this.events.forEach(event => {
          (map[event.date] = (map[event.date] || [])).push(event)
          if (event.days !== undefined) {
            let timestamp = parseTimestamp(event.date)
            let days = event.days
            // add a new event for each day
            // skip 1st one which would have been done above
            do {
              timestamp = addToDate(timestamp, { day: 1 })
              if (!map[timestamp.date]) {
                map[timestamp.date] = []
              }
              map[timestamp.date].push(event)
              // already accounted for 1st day
            } while (--days > 1)
          }
        })
      }
      console.log(map)
      return map
    },
    dateToTimestamp () {
      return (v) => {
        return date.formatDate(v, 'YYYY-MM-DD')
      }
    }
  },
  created () {
    this.getPosts()
  }
}
</script>

<template>
  <div>
    <b-tabs lazy>
      <template #tabs-start>
        <li role="presentation" class="nav-item align-self-center mr-3"><b>Season</b></li>
      </template>
      <b-tab :title="season.name" v-for="season in seasons" :key="`season-${season.yearEnd}`">
        <Season :yearEnd="season.yearEnd" class="mt-3"/>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import Season from '@/components/Season'

export default {
  components: {
    Season
  },
  data: function () {
    return {
      seasons: [{
        name: '2022/2023',
        yearEnd: 2023
      }, {
        name: '2021/2022',
        yearEnd: 2022
      }]
    }
  }
}
</script>

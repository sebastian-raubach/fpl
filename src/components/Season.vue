<template>
  <div v-if="parsedData">
    <b-row>
      <b-col cols=12 md=4 class="mb-3">
        <b-card class="h-100" v-if="bestTeam">
          <b-card-title><BIconAward /> Best team</b-card-title>
          <b-card-sub-title>{{ bestTeam.name }}</b-card-sub-title>
          Points: {{ bestTeam.points }}
        </b-card>
      </b-col>
      <b-col cols=12 md=4 class="mb-3">
        <b-card class="h-100" v-if="bestImprovement">
          <b-card-title><BIconChevronDoubleUp /> Best improvement</b-card-title>
          <b-card-sub-title>{{ bestImprovement.name }}</b-card-sub-title>
          Regression gradient: {{ bestImprovement.gradient.toFixed(2) }}
        </b-card>
      </b-col>
      <b-col cols=12 md=4 class="mb-3">
        <b-card class="h-100" v-if="worstImprovement">
          <b-card-title><BIconChevronDoubleDown /> Worst improvement</b-card-title>
          <b-card-sub-title>{{ worstImprovement.name }}</b-card-sub-title>
          Regression gradient: {{ worstImprovement.gradient.toFixed(2) }}
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols=12 md=4 class="mb-3">
        <b-card class="h-100" v-if="bestAverageTeam">
          <b-card-title><BIconAlignTop /> Highest average standing</b-card-title>
          <b-card-sub-title>{{ bestAverageTeam.name }}</b-card-sub-title>
          Avg. standing: {{ bestAverageTeam.avgPosition.toFixed(2) }}
        </b-card>
      </b-col>
      <b-col cols=12 md=4 class="mb-3">
        <b-card class="h-100" v-if="highestScore">
          <b-card-title><BIconArrowUpCircle /> Highest single game score</b-card-title>
          <b-card-sub-title>{{ highestScore.name }}</b-card-sub-title>
          Points: {{ highestScore.points }} in GW {{ highestScore.gw }}
        </b-card>
      </b-col>
      <b-col cols=12 md=4 class="mb-3">
        <b-card class="h-100" v-if="lowestScore">
          <b-card-title><BIconArrowDownCircle /> Lowest single game score</b-card-title>
          <b-card-sub-title>{{ lowestScore.name }}</b-card-sub-title>
          Points: {{ lowestScore.points }} in GW {{ lowestScore.gw }}
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols=12 md=4 class="mb-3">
        <b-card class="h-100" v-if="highestTransfer">
          <b-card-title><BIconCashCoin /> Highest extra transfer costs</b-card-title>
          <b-card-sub-title>{{ highestTransfer.name }}</b-card-sub-title>
          Transfer costs: {{ highestTransfer.transfer }}
        </b-card>
      </b-col>
      <b-col cols=12 md=4 class="mb-3">
        <b-card class="h-100" v-if="efficientTransfer">
          <b-card-title><BIconGraphUp /> Most efficient extra transfers</b-card-title>
          <b-card-sub-title>{{ efficientTransfer.name }}</b-card-sub-title>
          Points per transfer cost: {{ efficientTransfer.ratio.toFixed(2) }}
        </b-card>
      </b-col>
      <b-col cols=12 md=4 class="mb-3">
        <b-card class="h-100" v-if="inefficientTransfer">
          <b-card-title><BIconGraphDown /> Least efficient extra transfers</b-card-title>
          <b-card-sub-title>{{ inefficientTransfer.name }}</b-card-sub-title>
          Points per transfer cost: {{ inefficientTransfer.ratio.toFixed(2) }}
        </b-card>
      </b-col>
      <b-col cols=12>
        <small class="text-muted">The transfer stats are based on non-free transfers only, i.e. those exceeding the allowed number of free transfers.</small>
      </b-col>
    </b-row>

    <h1 class="mt-3">Standings over time</h1>
    <div :id="`ranking-${yearEnd}`" />
    <h1 class="mt-3">Points over time</h1>
    <div :id="`points-${yearEnd}`" />

    <h1>Statistics table</h1>

    <b-form-group label="Sort table by" label-for="sort-options">
      <b-button-group id="sort-options">
        <b-button v-for="option in sortTableByOptions" :key="`table-sort-by-${option.key}`" :pressed="option.key === sortTableBy" @click="setSortBy(option)">
          {{ option.text }}
        </b-button>
      </b-button-group>
    </b-form-group>
    <b-table hover
             striped
             responsive
             :sort-compare="sortTable"
             :sort-by="`gw${gameweeks.length - 1}`"
             :sort-desc="false"
             sort-direction="last"
             sticky-header="75vh"
             :items="tableData"
             :fields="columns"
             ref="table" >
      <template v-slot:cell(team)="data">
        <span>{{ data.item.team }}</span>
      </template>
      <template v-slot:cell()="data">
        <div class="text-nowrap">Points: {{data.item[`gw${data.field.fieldIndex}`].points}}</div>
        <div class="text-nowrap">Cumulative: {{data.item[`gw${data.field.fieldIndex}`].cumulative}}</div>
        <div class="text-nowrap">
          <span>Standing: {{data.item[`gw${data.field.fieldIndex}`].standing}}</span>
          <BIconChevronDoubleUp class="ml-1 status-upup" v-if="data.item[`gw${data.field.fieldIndex}`].status === 'upup'" />
          <BIconChevronUp class="ml-1 status-up" v-if="data.item[`gw${data.field.fieldIndex}`].status === 'up'" />
          <BIconChevronDoubleDown class="ml-1 status-downdown" v-if="data.item[`gw${data.field.fieldIndex}`].status === 'downdown'" />
          <BIconChevronDown class="ml-1 status-down" v-if="data.item[`gw${data.field.fieldIndex}`].status === 'down'" />
          <BIconDot class="ml-1 status-same" v-if="data.item[`gw${data.field.fieldIndex}`].status === 'same'" />
        </div>
      </template>
    </b-table>
  </div>
</template>

<script>
import { BIconAward, BIconCashCoin, BIconGraphUp, BIconChevronUp, BIconChevronDown, BIconDot, BIconAlignTop, BIconArrowUpCircle, BIconChevronDoubleDown, BIconArrowDownCircle, BIconChevronDoubleUp, BIconGraphDown } from 'bootstrap-vue'
import regression from 'regression'

const d3Dsv = require('d3-dsv')
const Plotly = require('plotly.js/lib/core')

// Only register the chart types we're actually using to reduce the final bundle size
Plotly.register([
  require('plotly.js/lib/scatter')
])

export default {
  components: {
    BIconAward,
    BIconCashCoin,
    BIconGraphUp,
    BIconDot,
    BIconChevronDown,
    BIconChevronDoubleUp,
    BIconChevronDoubleDown,
    BIconGraphDown,
    BIconArrowUpCircle,
    BIconChevronUp,
    BIconAlignTop,
    BIconArrowDownCircle
  },
  props: {
    yearEnd: {
      type: Number,
      default: 2023
    }
  },
  data: function () {
    return {
      sortTableByOptions: [
        { key: 'standing', text: 'Standing', getValue: (row) => row.standing },
        { key: 'points', text: 'GW Points', getValue: (row) => row.points },
        { key: 'cumulative', text: 'Cumulative points', getValue: (row) => row.cumulative }
      ],
      sortTableBy: 'standing'
    }
  },
  computed: {
    columns: function () {
      const columns = [{
        key: 'team',
        sortable: true,
        label: 'Team',
        stickyColumn: true
      }]

      this.gameweeks.forEach(i => columns.push({
        key: 'gw' + (i - 1),
        label: 'GW' + i,
        sortable: true,
        fieldIndex: i - 1
      }))

      return columns
    },
    gameweeks: function () {
      if (this.rawData) {
        let max = 0
        for (let i = 1; i < Object.keys(this.rawData[0]).length - 1; i++) {
          const weekHasData = this.rawData.map(r => r[i]).filter(r => r !== '').length > 0
          if (weekHasData) {
            max++
          }
        }
        return Array.from(Array(max).keys()).map(i => i + 1)
      } else {
        return 0
      }
    },
    rawData: function () {
      if (this.yearEnd) {
        return d3Dsv.tsvParse(require(`@/assets/data-${this.yearEnd}.txt`).default)
      } else {
        return null
      }
    },
    tableData: function () {
      if (this.parsedData) {
        return this.parsedData.map((p, pi) => {
          const result = {
            team: p.name
          }

          this.gameweeks.forEach((g, i) => {
            let status = null
            const standing = this.parsedData.length - this.rankingPerDay[pi][i]

            if (i > 0) {
              const diff = standing - result[`gw${i - 1}`].standing

              if (diff === 0) {
                status = 'same'
              } else if (diff > 0 && diff < 3) {
                status = 'down'
              } else if (diff >= 3) {
                status = 'downdown'
              } else if (diff < 0 && diff > -3) {
                status = 'up'
              } else if (diff <= -3) {
                status = 'upup'
              }
            }

            result[`gw${i}`] = {
              points: p.points[i],
              cumulative: p.cumulative[i],
              standing: standing,
              status: status
            }
          })

          return result
        })
      } else {
        return null
      }
    },
    bestTeam: function () {
      if (this.parsedData) {
        const result = this.parsedData.concat().sort((a, b) => b.cumulative[b.cumulative.length - 1] - a.cumulative[a.cumulative.length - 1])[0]
        const cumulative = result.cumulative.filter(c => c !== null)
        return {
          name: result.name,
          points: cumulative[cumulative.length - 1]
        }
      } else {
        return null
      }
    },
    worstImprovement: function () {
      if (this.parsedData && this.rankingPerDay) {
        const teamToIndex = {}
        this.parsedData.forEach((t, i) => {
          teamToIndex[t.name] = i
        })
        const result = this.parsedData.concat().sort((a, b) => {
          const ad = this.rankingPerDay[teamToIndex[a.name]].map((v, day) => [day, v + 1])
          const bd = this.rankingPerDay[teamToIndex[b.name]].map((v, day) => [day, v + 1])

          const gradA = regression.linear(ad)
          const gradB = regression.linear(bd)

          a.gradient = gradA.equation[0]
          b.gradient = gradB.equation[0]

          return a.gradient - b.gradient
        })[0]
        return {
          name: result.name,
          gradient: result.gradient
        }
      } else {
        return null
      }
    },
    bestImprovement: function () {
      if (this.parsedData && this.rankingPerDay) {
        const teamToIndex = {}
        this.parsedData.forEach((t, i) => {
          teamToIndex[t.name] = i
        })
        const result = this.parsedData.concat().sort((a, b) => {
          const ad = this.rankingPerDay[teamToIndex[a.name]].map((v, day) => [day, v + 1])
          const bd = this.rankingPerDay[teamToIndex[b.name]].map((v, day) => [day, v + 1])

          const gradA = regression.linear(ad)
          const gradB = regression.linear(bd)

          a.gradient = gradA.equation[0]
          b.gradient = gradB.equation[0]

          return b.gradient - a.gradient
        })[0]
        return {
          name: result.name,
          gradient: result.gradient
        }
      } else {
        return null
      }
    },
    bestAverageTeam: function () {
      if (this.parsedData && this.rankingPerDay) {
        const teamToIndex = {}
        this.parsedData.forEach((t, i) => {
          teamToIndex[t.name] = i
        })
        const result = this.parsedData.concat().sort((a, b) => {
          const ad = this.rankingPerDay[teamToIndex[a.name]].map(v => this.parsedData.length - v)
          const bd = this.rankingPerDay[teamToIndex[b.name]].map(v => this.parsedData.length - v)

          a.avgPosition = this.avg(ad)
          b.avgPosition = this.avg(bd)

          return a.avgPosition - b.avgPosition
        })[0]
        return {
          name: result.name,
          avgPosition: result.avgPosition
        }
      } else {
        return null
      }
    },
    highestScore: function () {
      if (this.parsedData) {
        const result = this.parsedData.concat().sort((a, b) => Math.max(...b.points) - Math.max(...a.points))[0]
        const points = result.points.map((p, i) => {
          return {
            p: p,
            gw: i + 1
          }
        })
        points.sort((a, b) => b.p - a.p)
        return {
          name: result.name,
          points: points[0].p,
          gw: points[0].gw
        }
      } else {
        return null
      }
    },
    lowestScore: function () {
      if (this.parsedData) {
        const result = this.parsedData.concat().sort((a, b) => Math.min(...a.points.filter(p => p !== 0)) - Math.min(...b.points.filter(p => p !== 0)))[0]
        const points = result.points.map((p, i) => {
          return {
            p: p,
            gw: i + 1
          }
        })
        points.sort((a, b) => a.p - b.p)
        return {
          name: result.name,
          points: points[0].p,
          gw: points[0].gw
        }
      } else {
        return null
      }
    },
    highestTransfer: function () {
      if (this.parsedData) {
        const result = this.parsedData.concat().sort((a, b) => b.transfer - a.transfer)[0]
        return {
          name: result.name,
          transfer: result.transfer
        }
      } else {
        return null
      }
    },
    efficientTransfer: function () {
      if (this.parsedData) {
        const result = this.parsedData.concat().filter(a => a.transfer).sort((a, b) => (b.cumulative[b.cumulative.length - 1] / b.transfer) - (a.cumulative[a.cumulative.length - 1] / a.transfer))[0]
        const cumulative = result.cumulative.filter(c => c !== null)
        return {
          name: result.name,
          ratio: cumulative[cumulative.length - 1] / result.transfer
        }
      } else {
        return null
      }
    },
    inefficientTransfer: function () {
      if (this.parsedData) {
        const result = this.parsedData.concat().filter(a => a.transfer).sort((a, b) => (a.cumulative[a.cumulative.length - 1] / a.transfer) - (b.cumulative[b.cumulative.length - 1] / b.transfer))[0]
        const cumulative = result.cumulative.filter(c => c !== null)
        return {
          name: result.name,
          ratio: cumulative[cumulative.length - 1] / result.transfer
        }
      } else {
        return null
      }
    },
    parsedData: function () {
      if (this.rawData) {
        return this.rawData.map((r, i) => {
          const points = []
          const cumulative = []

          this.gameweeks.forEach(gw => {
            if (r[gw]) {
              points.push(+r[gw])
              cumulative.push(+r[gw] + (cumulative.length > 0 ? cumulative[cumulative.length - 1] : 0))
            } else {
              points.push(null)
              cumulative.push(null)
            }
          })

          return {
            points,
            cumulative,
            name: r.Team,
            index: i,
            transfer: +r['Transfer fees']
          }
        })
      } else {
        return null
      }
    },
    rankingPerDay: function () {
      if (this.parsedData) {
        const ppd = this.gameweeks.map(gw => {
          const points = this.parsedData.map(t => t.cumulative[gw - 1])
          points.sort((a, b) => a - b)
          return points
        })

        return this.parsedData.map((t, i) => {
          return this.gameweeks.map(gw => {
            const points = this.parsedData[i].cumulative[gw - 1]
            if (points !== undefined && points !== null) {
              // return this.parsedData.length - ppd[gw - 1].lastIndexOf(points)
              return ppd[gw - 1].lastIndexOf(points)
            } else {
              return null
            }
          })
        })
      } else {
        return null
      }
    }
  },
  methods: {
    setSortBy: function (option) {
      this.sortTableBy = option.key
      this.$refs.table.refresh()
    },
    sortTable: function (a, b, key) {
      if (key === 'team') {
        return a.team.localeCompare(b.team)
      } else {
        const op = this.sortTableByOptions.find(o => o.key === this.sortTableBy)
        const ap = op.getValue(a[key])
        const bp = op.getValue(b[key])

        return ap === bp ? 0 : Math.sign(ap - bp)
      }
    },
    avg: function (arr) {
      return arr.reduce((a, b) => a + b) / arr.length
    },
    updatePoints: function () {
      const traces = this.parsedData.map(r => {
        const x = []
        const y = []

        this.gameweeks.forEach(gw => {
          x.push(gw)
          y.push(r.cumulative[gw - 1])
        })

        return {
          x,
          y,
          type: 'scatter',
          name: r.name
        }
      })

      traces.sort((a, b) => b.y[b.y.length - 1] - a.y[a.y.length - 1])

      const layout = {
        height: Math.max(400, this.parsedData.length * 30 + 50),
        margin: { l: 0, t: 0, r: 0, b: 40 },
        xaxis: {
          automargin: true,
          showgrid: false,
          title: { text: 'Gameweek' },
          fixedrange: true
        },
        yaxis: {
          automargin: true,
          showgrid: true,
          fixedrange: true
          // title: { text: 'Cumulative Points' }
        },
        hovermode: 'x',
        legend: {
          xanchor: 'left',
          yanchor: 'bottom',
          y: 1,
          x: 0,
          orientation: 'h'
        }
      }

      const config = {
        responsive: true,
        displaylogo: false
      }

      Plotly.newPlot(`points-${this.yearEnd}`, traces, layout, config)
    },
    updateRanking: function () {
      const traces = this.parsedData.map((r, i) => {
        const x = []
        const y = []

        this.gameweeks.forEach(gw => {
          x.push(gw)
          y.push(this.rankingPerDay[i][gw - 1])
        })

        return {
          x,
          y,
          type: 'scatter',
          name: r.name,
          mode: 'lines+markers'
        }
      })

      traces.sort((a, b) => b.y[b.y.length - 1] - a.y[a.y.length - 1])

      const layout = {
        height: Math.max(400, this.parsedData.length * 30 + 50),
        margin: { l: 0, t: 0, r: 0, b: 40 },
        xaxis: {
          automargin: true,
          showgrid: false,
          title: { text: 'Gameweek' },
          fixedrange: true
        },
        yaxis: {
          automargin: true,
          showgrid: true,
          // title: { text: 'Standings' },
          tickvals: Array.from(Array(this.parsedData.length).keys()),
          ticktext: Array.from(Array(this.parsedData.length).keys()).map(i => this.parsedData.length - i),
          fixedrange: true
        },
        hovermode: 'x',
        legend: {
          xanchor: 'left',
          yanchor: 'bottom',
          y: 1,
          x: 0,
          orientation: 'h'
        }
      }

      const config = {
        responsive: true,
        displaylogo: false
      }

      Plotly.newPlot(`ranking-${this.yearEnd}`, traces, layout, config)
    }
  },
  mounted: function () {
    this.updatePoints()
    this.updateRanking()
  }
}
</script>

<style scoped>
.status-down {
  color: #e74c3c;
}
.status-downdown {
  color: #c0392b;
}
.status-up {
  color: #2ecc71;
}
.status-upup {
  color: #27ae60;
}
.status-same {
  color: #95a5a6;
}
</style>

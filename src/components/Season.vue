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
          Correlation gradient: {{ bestImprovement.gradient.toFixed(2) }}
        </b-card>
      </b-col>
      <b-col cols=12 md=4 class="mb-3">
        <b-card class="h-100" v-if="worstImprovement">
          <b-card-title><BIconChevronDoubleDown /> Worst improvement</b-card-title>
          <b-card-sub-title>{{ worstImprovement.name }}</b-card-sub-title>
          Correlation gradient: {{ worstImprovement.gradient.toFixed(2) }}
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
  </div>
</template>

<script>
import { BIconAward, BIconCashCoin, BIconGraphUp, BIconAlignTop, BIconArrowUpCircle, BIconChevronDoubleDown, BIconArrowDownCircle, BIconChevronDoubleUp, BIconGraphDown } from 'bootstrap-vue'
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
    BIconChevronDoubleUp,
    BIconChevronDoubleDown,
    BIconGraphDown,
    BIconArrowUpCircle,
    BIconAlignTop,
    BIconArrowDownCircle
  },
  props: {
    yearEnd: {
      type: Number,
      default: 2023
    }
  },
  computed: {
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
        return this.rawData.map(r => {
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
          tickmode: 'linear',
          tick0: 1,
          dtick: 1
        },
        yaxis: {
          automargin: true,
          showgrid: true
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
          tickmode: 'linear',
          tick0: 1,
          dtick: 1
        },
        yaxis: {
          automargin: true,
          showgrid: true,
          // title: { text: 'Standings' },
          tickvals: Array.from(Array(this.parsedData.length).keys()),
          ticktext: Array.from(Array(this.parsedData.length).keys()).map(i => this.parsedData.length - i)
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

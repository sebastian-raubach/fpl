<template>
  <div>
    <b-row>
      <b-col cols=12 md=4 class="mb-3">
        <b-card class="h-100" v-if="bestTeam">
          <b-card-title><BIconAward /> Best team</b-card-title>
          <b-card-sub-title>{{ bestTeam.name }}</b-card-sub-title>
          Points: {{ bestTeam.points }}
        </b-card>
      </b-col>
      <b-col cols=12 md=4 class="mb-3">
        <b-card class="h-100" v-if="highestScore">
          <b-card-title><BIconArrowUpCircle /> Highest single game score</b-card-title>
          <b-card-sub-title>{{ highestScore.name }}</b-card-sub-title>
          Points: {{ highestScore.points }}
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
        <b-card class="h-100" v-if="unefficientTransfer">
          <b-card-title><BIconGraphDown /> Least efficient extra transfers</b-card-title>
          <b-card-sub-title>{{ unefficientTransfer.name }}</b-card-sub-title>
          Points per transfer cost: {{ unefficientTransfer.ratio.toFixed(2) }}
        </b-card>
      </b-col>
      <b-col cols=12>
        <small class="text-muted">The transfer stats are based on non-free transfers only, i.e. those exceeding the allowed number of free transfers.</small>
      </b-col>
    </b-row>

    <h1 class="mt-3">Standings over time</h1>
    <div id="ranking" />
    <h1 class="mt-3">Points over time</h1>
    <div id="points" />
  </div>
</template>

<script>
import file from '@/assets/data-2022.txt'

import { BIconAward, BIconCashCoin, BIconGraphUp, BIconArrowUpCircle, BIconGraphDown } from 'bootstrap-vue'

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
    BIconGraphDown,
    BIconArrowUpCircle
  },
  data: function () {
    return {
      gameweeks: Array.from(Array(38).keys()).map(i => i + 1),
      rawData: d3Dsv.tsvParse(file)
    }
  },
  computed: {
    bestTeam: function () {
      if (this.parsedData) {
        const result = this.parsedData.concat().sort((a, b) => b.cumulative[b.cumulative.length - 1] - a.cumulative[a.cumulative.length - 1])[0]
        return {
          name: result.name,
          points: result.cumulative[result.cumulative.length - 1]
        }
      } else {
        return null
      }
    },
    highestScore: function () {
      if (this.parsedData) {
        const result = this.parsedData.concat().sort((a, b) => Math.max(...b.points) - Math.max(...a.points))[0]
        return {
          name: result.name,
          points: Math.max(...result.points)
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
        return {
          name: result.name,
          ratio: result.cumulative[result.cumulative.length - 1] / result.transfer
        }
      } else {
        return null
      }
    },
    unefficientTransfer: function () {
      if (this.parsedData) {
        const result = this.parsedData.concat().filter(a => a.transfer).sort((a, b) => (a.cumulative[a.cumulative.length - 1] / a.transfer) - (b.cumulative[b.cumulative.length - 1] / b.transfer))[0]
        return {
          name: result.name,
          ratio: result.cumulative[result.cumulative.length - 1] / result.transfer
        }
      } else {
        return null
      }
    },
    parsedData: function () {
      return this.rawData.map(r => {
        const points = []
        const cumulative = []

        this.gameweeks.forEach(gw => {
          if (r[gw]) {
            points.push(+r[gw])
          } else {
            points.push(null)
          }

          cumulative.push(+r[gw] + (cumulative.length > 0 ? cumulative[cumulative.length - 1] : 0))
        })

        return {
          points,
          cumulative,
          name: r.Team,
          transfer: +r['Transfer fees']
        }
      })
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
        height: 600,
        xaxis: {
          automargin: true,
          showgrid: false,
          title: { text: 'Gameweek' }
        },
        yaxis: {
          automargin: true,
          showgrid: true,
          title: { text: 'Cumulative Points' }
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

      console.log(traces)

      Plotly.newPlot('points', traces, layout, config)
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
        xaxis: {
          automargin: true,
          showgrid: false,
          title: { text: 'Gameweek' }
        },
        yaxis: {
          automargin: true,
          showgrid: false,
          title: { text: 'Standings' },
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

      console.log(traces)

      Plotly.newPlot('ranking', traces, layout, config)
    }
  },
  mounted: function () {
    this.updatePoints()
    this.updateRanking()
  }
}
</script>

<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand :to="{ name: 'home' }" class="d-flex align-items-center">
        Fantasy Premier League
      </b-navbar-brand>
    </b-navbar>

    <b-container class="my-3">
      <b-jumbotron header="Hutt One">
      </b-jumbotron>

      <router-view/>
    </b-container>
  </div>
</template>

<style lang="scss">
@import '~bootswatch/dist/materia/variables';
@import '~bootstrap/scss/bootstrap';
@import '~bootstrap-vue/src/index.scss';
@import '~bootswatch/dist/materia/bootswatch';
</style>

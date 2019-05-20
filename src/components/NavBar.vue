<template>
    <b-navbar toggleable="md" type="light" variant="info" class="nav-bar">
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
        <b-navbar-brand href="#" style="color:white">Narupedia</b-navbar-brand>
        <b-collapse is-nav id="nav_collapse">
            <b-navbar-nav class="ml-auto logged_user" >
                Welcome {{logged_user}}!
            </b-navbar-nav>
        </b-collapse>
    </b-navbar>
</template>

<script>
export default {
  name: "NavBar",
  props: {
    logged_user: String
  }
};
</script>

<style scoped>
.nav-bar {
  background: #3498db;
}
</style>
<template>
  <router-view />
</template>

<style>
@font-face {
  font-family: pixel;
  src: url('/chatee/dist/pixel.ttf');
}
#app {
  font-family: pixel, 微软雅黑, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>

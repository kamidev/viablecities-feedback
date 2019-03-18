<template>
  <div class="callback">Callback</div>
</template>

<script>
export default {
  name: 'callback',
  mounted() {
    // eslint-disable-next-line
    this.$auth.handleAuthentication().then(data => {
      this.$router.push({ name: 'home' })
    })
  }
}
</script>

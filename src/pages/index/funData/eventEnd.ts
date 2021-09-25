import { ref } from 'vue'

export default function eventEnd() {
  const eventEndShow = ref(false)
  function openEventEnd() {
    eventEndShow.value = true
  }
  function closeEventEnd() {
    eventEndShow.value = false
  }
  return {
    eventEndShow,
    openEventEnd,
    closeEventEnd,
  }
}

<template>
  <div class="pace-done vertical-layout navbar-floating footer-static" :class="[
    ['md', 'xs'].includes(type) ? 'vertical-overlay-menu' : 'menu-expanded vertical-menu-modern',
    dashboard.isOpened ? 'menu-open' : 'menu-hide',
  ]">
    <DashboardHeader />

    <DashboardNav />

    <DashboardContent />

    <div class="sidenav-overlay" :class="{ show: dashboard.isOpened }" @click="dashboard.setIsOpened(false)"></div>
  </div>
</template>

<script setup>
import DashboardNav from "@/components/Document/Dashboard/DashboardNav.vue";
import DashboardHeader from "@/components/Document/Dashboard/DashboardHeader.vue";
import DashboardContent from "@/components/Document/Dashboard/DashboardContent.vue";
import { dashboard } from "@/store/dashboard";
import { useBreakpointsComposable } from "@/composables/useBreakpoints";
const { type } = useBreakpointsComposable();

</script>

<style scoped>
@import "@/assets/css/vertical-menu.min.css";
</style>
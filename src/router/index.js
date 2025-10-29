import Vue from 'vue'
import VueRouter from 'vue-router'
import Start from '../views/Start.vue'
import Book from '../views/Book.vue'
import LoveFlipTimer from '@/components/LoveFlipTimer.vue'
import LoveTree from '@/components/LoveTree.vue'
import Four from '../views/Four.vue'
import Foreword from '../views/foreword.vue'
import MusicPlayer from '../components/MusicPlayer.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'book',
    component: Book
  },
  {
    path: '/start',
    name: 'start',
    component: Start
  },
  {
    path: '/loveflip',
    name: 'loveflip',
    component: LoveFlipTimer
  },
  {
    path: '/four',
    name: 'four',
    component: Four
  },
  {
    path: '/lovertree',
    name: 'lovertree',
    component: LoveTree
  },
  {
    path: '/foreword',
    name: 'foreword',
    component: Foreword
  },
  {
    path: '/musicplayer',
    name: 'musicplayer',
    component: MusicPlayer
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

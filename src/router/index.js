import Vue from 'vue'
import VueRouter from 'vue-router'
import Start from '../views/Start.vue'
import Book from '../views/Book.vue'
import LoveFlipTimer from '@/components/LoveFlipTimer.vue'
import LoveTree from '@/components/LoveTree.vue'
import Six from '../views/six.vue'
import Seven from '../views/letter-7-E.vue'  
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
    path: '/six',
    name: 'six',
    component: Six
  },
  {
    path: '/seven',
    name: 'seven',
    component: Seven
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

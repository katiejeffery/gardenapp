const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('pages/Index.vue'), name: 'home' },
      { path: '/mygarden', component: () => import('pages/MyGarden.vue'), name: 'mygarden' },
      { path: '/calendar', component: () => import('pages/Calendar.vue') },
      { path: '/addplant', component: () => import('pages/AddPlant.vue'), name: 'addplant' },
      { path: '/plantinfo/:id', component: () => import('pages/PlantInfo.vue'), name: 'plantinfo' },
      { path: '/profile', component: () => import('src/pages/Profile.vue') },
      { path: '/social', component: () => import('pages/Social.vue'), name: 'social' },
      { path: '/camera/:origin', component: () => import('pages/Camera.vue'), name: 'camera' },
      { path: '/settings', component: () => import('pages/Settings.vue'), name: 'settings' }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes

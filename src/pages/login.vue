<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-lg" style="width: 350px">
      <div class="text-h6 text-center q-mb-md">
        Prihlásenie
      </div>

        <q-input
        v-model="userId"
        label="Zadajte vaše ID"
        class="q-mb-md no-spin"
        type="number"
        :error="success === false"
        error-message="ID nebolo nájdené"
        color="primary"
        />


      <q-btn
        color="primary"
        label="Pokračovať"
        class="full-width"
        :disable="!userId"
        @click="login"
      />
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "IndexPage",

  data() {
    return {
      userId: null as number | null,
      success: null as boolean | null,
    };
  },

  methods: {
    async login() {
      if (!this.userId) return;
       const response = await fetch('https://backendday.vercel.app/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid: this.userId }),
    });

    const result = await response.json();
    console.log(result);

    if (result.success) {
      sessionStorage.setItem('userId', result.userId);
      await this.$router.push('/');
    }
    else {
      this.success = false;
    }

    }
  }
});
</script>

<style>
.no-spin input[type="number"]::-webkit-inner-spin-button,
.no-spin input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spin input[type="number"] {
  -moz-appearance: textfield;
}
</style>

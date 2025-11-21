
<template>
  <q-page padding class="bg-grey-2 flex flex-center">

    <q-card flat class="q-pa-xl bg-white rounded-borders shadow-2 flex justify-center align-center" style="height: 700px; max-height: 95%; min-width: 80%;">

      <div class="row q-col-gutter-xl items-start">

        <!-- LEFT SECTION – USER INFO -->
        <div class="col-12 col">

          <div class="row items-center q-mb-md">
            <div class="bg-blue-1 text-primary flex flex-center rounded-circle" 
                 style="width: 64px; height: 64px; font-size: 22px; font-weight: 600;">
              {{ userId }}
            </div>

            <div class="q-ml-md">
              <div class="text-body1 text-grey-8">Prihlásený používateľ</div>
              <div class="text-subtitle1"><b>ID:</b> {{ userId }}</div>
            </div>
          </div>

          <div class="text-subtitle2 text-grey-7 q-mb-sm">Váš termín</div>

          <div v-if="selectedDate?.date !== '' && selectedDate?.date != null "
               class="bg-green-1 q-pa-sm rounded-borders text-body1 text-green-8">
            {{ selectedDate?.date }}
          </div>
          

          <div v-else 
               class="bg-red-1 q-pa-sm rounded-borders text-red-8 text-body1">
            Žiadny dátum nebol vybraný
          </div>

        </div>
         
        <!-- MIDDLE SECTION – AVAILABLE DATES -->
        <div class="col-12 col-md-6">

          <div class="text-h6 q-mb-sm">Dostupné termíny</div>

          <div v-if="dates.length === 0" class="text-grey-7">
            Žiadne dostupné termíny.
          </div>

          <q-list v-else>

            <q-item
              v-for="d in dates"
              :key="<number>d.id"
              clickable
              @click="selectDate(d)"
              :active="clickedDate && clickedDate.id === d.id"
              active-class="bg-blue-1"
              class="q-my-sm rounded-borders border-gray-3"
              style="border: 1px solid gray;"
            >
              <q-item-section>{{ d.date }}</q-item-section>



            </q-item>

          </q-list>

        </div>


        <q-dialog v-model="showAlert" persistent transition-show="scale" transition-hide="scale">
          <q-card class="q-pa-xl" style="min-width: 400px; max-width: 90vw;">
            
            <div class="text-h6 q-mb-md">
              Potvrdenie termínu
            </div>

            <div class="text-body1 q-mb-lg">
              Naozaj sa chcete prihlásiť na vybraný termín?
            </div>

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="Zrušiť" color="grey-7" @click="showAlert = false" />
              <q-btn unelevated color="primary" label="Vybrať termín" @click="handleSignDate" />
            </div>

          </q-card>
        </q-dialog>

        <q-dialog v-model="showInfo" persistent transition-show="scale" transition-hide="scale">
          <q-card class="q-pa-xl bg-gray" style="min-width: 400px; max-width: 90vw;">
            
            <div class="text-h6 q-mb-md">
              Informácia
            </div>

            <div class="text-body1 q-mb-lg">
              Termín bol úspešne vybraný.
            </div>

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="Zavrieť" color="grey-7" @click="showInfo = false" />
            </div>

          </q-card>
        </q-dialog>

        <!-- RIGHT SECTION – REVIEW & SUBMIT -->
        <div class="col-12 col-md-6">

          <div class="bg-grey-1 q-pa-md rounded-borders q-mb-lg">

            <div class="text-subtitle1 q-mb-sm"><b>Výber</b></div>

            <div class="text-body2 text-grey-8 q-mb-sm ">
              <span v-if="selectedDate?.date === '' || selectedDate?.date == null"> Ešte nemáte vybraný termín. Vyberte si z dostupných možností a kliknite na "Vybrať termín". <br><br></span>
              <span v-else> Váš termín vidíte v hornej časti. Ak si chcete termín zmeniť, vyberte z dostupných možností a kliknite na "Zmeniť termín".</span>
            </div>

            <div class="q-mt-md">
              <div class="text-subtitle2 text-grey-7">Vybraný:</div>

              <div v-if="clickedDate" class="text-body1 text-primary q-mt-xs">
                {{ clickedDate?.date }}
              </div>

              <div v-else class="text-body1 text-gray-6 q-mt-xs">-</div>
            </div>

          </div>

          <q-btn
            :disable="clickedDate == null"
            :label="selectedDate?.date == null || selectedDate?.date === '' ? 'Vybrať termín' : 'Zmeniť termín'"
            icon="event"
            color="primary"
            size="lg"
            unelevated
            class="full-width"
            @click="handleDateSelection"
          />

        </div>

      </div>

    </q-card>
   
  </q-page>
</template>



<script lang="ts">
import { defineComponent } from "vue";
import type { dateSelection } from "../components/models";
export default defineComponent({
  name: "MainPage",

  data() {
    return {
      userId: null as number | null,
      selectedDate: null as dateSelection | null,
      dates: [] as dateSelection[],
      clickedDate: null as dateSelection | null,
      showAlert: false,
      showInfo: false,
    };
  },

  created() {
    const id = sessionStorage.getItem("userId");
    this.userId = Number(id);

  },

  methods: {
    selectDate(d: dateSelection) {
      if (this.clickedDate == d){
        this.clickedDate = null;
        return;
      }
      this.clickedDate = d;
    },
     
    formatDate(rawDate: string) {
    const d = new Date(rawDate);

    return d.toLocaleDateString("sk-SK", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"

    });
  },

  handleDateSelection(){
    this.showAlert = true;
    
  },
  handleSignDate(){
    this.showAlert = false;
    this.selectedDate = null as dateSelection | null;
    this.dates = [] 
    if (!this.clickedDate || !this.userId) return;
    fetch('https://backendday.vercel.app/api/selectDate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userid: this.userId,
        dateid: this.clickedDate.id
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.selectedDate = this.clickedDate;
          this.clickedDate = null;
          this.getDates();
          this.showInfo = true;
          setTimeout(() => {
            this.showInfo = false;
          }, 5000);

        } else {
          alert('Chyba pri výbere dátumu. Skúste to znova.');
        }
      })
      .catch(error => {
        console.error('Error selecting date:', error);
      });
      this.clickedDate = null;
  },

  getDates(){
        fetch('https://backendday.vercel.app/api/getDates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userid: this.userId  
      })
    })
      .then(response => response.json())
      .then(data => {
        this.dates = data.dates.map((d: dateSelection) => ({
          id: d.id,
          date: this.formatDate(d.date) 
        })) as dateSelection[];

        if (data.selectedDates) {
          this.selectedDate = {
            id: null, 
            date: data.selectedDates.date1 ? this.formatDate(data.selectedDates.date1) : ""
          };
        }
      })
      .catch(error => {
        console.error('Error fetching dates:', error);
      });
  }

  },

  mounted() {
    this.getDates();
  }
});
</script>



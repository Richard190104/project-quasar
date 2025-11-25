<template>
  <q-page padding class="bg-grey-2 flex justify-center items-start">
    <q-card
      flat
      class="q-pa-xl bg-white rounded-borders shadow-2 flex justify-center align-center"
      style="width: 1200px; max-width: 1200px"
    >
      <div class="row q-col-gutter-xl items-start">
        <!-- LEFT SECTION – USER INFO -->
        <div class="col-12 col">
          <div class="row items-center q-mb-md">
            <div
              class="bg-blue-1 text-primary flex flex-center rounded-circle"
              style="font-size: 22px; font-weight: 600"
            >
              {{ userId }}
            </div>

            <div class="q-ml-md">
              <div class="text-body1 text-grey-8">Prihlásený používateľ</div>
              <div class="text-subtitle1"><b>ID:</b> {{ userId }}</div>
              <div v-if="userEmail">
                <b>email:</b>
                <p class="inline-block bg-gray-1 text-gray-8 q-pa-xs rounded-borders">
                  {{ userEmail }}
                </p>
                <q-icon
                  name="edit"
                  class="cursor-pointer"
                  @click="displayEmailChangePopup = true"
                ></q-icon>
              </div>
              <div v-else class="text-grey-7">
                <b>Email: </b>
                <p
                  class="inline-block bg-red-1 text-red-8 q-pa-xs rounded-borders cursor-pointer"
                  @click="displayEmailChangePopup = true"
                >
                  Zadať email
                </p>
              </div>
            </div>
          </div>

          <q-dialog v-model="displayEmailChangePopup">
            <q-card class="q-pa-lg" style="min-width: 350px">
              <div class="text-h6 q-mb-md">Zadajte váš email</div>

              <q-input
                v-model="emailInput"
                type="email"
                label="Email"
                filled
                clearable
                :error="emailError"
                :error-message="emailErrorMessage"
              />

              <div class="row justify-end q-gutter-sm q-mt-lg">
                <q-btn
                  flat
                  label="Zrušiť"
                  color="grey-7"
                  @click="displayEmailChangePopup = false"
                />
                <q-btn label="Uložiť" color="primary" @click="saveEmail" />
              </div>
            </q-card>
          </q-dialog>
          <div class="text-subtitle2 text-grey-7 q-mb-sm">Vaše termíny</div>

          <div
            v-if="selectedDate?.date !== '' && selectedDate?.date != null"
            class="bg-green-1 q-pa-sm rounded-borders text-body1 text-green-8"
          >
            {{ selectedDate?.date }}
          </div>
          <div
            v-if="selectedDate2?.date !== '' && selectedDate2?.date != null"
            class="bg-green-1 q-pa-sm rounded-borders text-body1 text-green-8 q-mt-sm"
          >
            {{ selectedDate2?.date }}
          </div>

          <div v-else class="bg-red-1 q-pa-sm rounded-borders text-red-8 text-body1">
            Termíny neboli vybrané.
          </div>
        </div>
        <q-dialog
          v-model="showCustomAlert"
          persistent
          transition-show="scale"
          transition-hide="scale"
        >
          <q-card class="q-pa-lg" style="min-width: 350px">
            <div class="text-h6 q-mb-md text-red-8">
              {{ customAlertMessage }}
            </div>

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn flat label="OK" color="grey-7" @click="showCustomAlert = false" />
            </div>
          </q-card>
        </q-dialog>
        <!-- MIDDLE SECTION – AVAILABLE DATES -->
        <div class="col-12 col-md-6 dates-scroll">
          <div class="text-h6 q-mb-sm">Dostupné termíny</div>
          <span>1. termín</span>
          <div v-if="allDates.length === 0" class="text-grey-7">Žiadne dostupné termíny.</div>
          <q-list bordered class="rounded-borders">
            <q-expansion-item
              v-for="(items, day) in groupedDates"
              :key="day"
              :label="formatDate(day, false)"
              icon="event"
              expand-separator
              dense
              group="days"
            >
              <q-list padding>
                <q-item
                  v-for="item in items"
                  :key="String(item.id)"
                  clickable
                  @click="selectDate(item)"
                  :active="clickedDate && clickedDate.id === item.id"
                  active-class="bg-blue-2 text-blue-10"
                  class="rounded-borders q-my-xs"
                  style="border: 1px solid #ccc"
                >
                  <q-item-section avatar>
                    <q-icon name="schedule" />
                  </q-item-section>

                  <q-item-section>
                    {{ item.date }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </q-list>
          <span v-if="clickedDate?.date != null">2. termín</span>
          <transition name="expand">
            <div v-if="dates2.length === 0 && clickedDate?.date != null" class="text-grey-7">
              Žiadne dostupné termíny.
            </div>
          </transition>
          <transition name="expand">
            <q-list v-show="clickedDate?.date != null" class="dates-wrap">
              <q-item
                v-for="d2 in dates2"
                :key="<number>d2.id"
                clickable
                @click="selectDate2(d2)"
                :active="clickedDate2 && clickedDate2.id === d2.id"
                active-class="bg-blue-1"
                class="q-my-sm rounded-borders border-gray-3"
                style="border: 1px solid gray"
              >
                <q-item-section avatar>
                  <q-icon name="schedule" />
                </q-item-section>
                <q-item-section>{{ d2.date }}</q-item-section>
              </q-item>
            </q-list>
          </transition>
        </div>

        <q-dialog v-model="showAlert" persistent transition-show="scale" transition-hide="scale">
          <q-card class="q-pa-xl" style="min-width: 400px; max-width: 90vw">
            <div class="text-h6 q-mb-md">Potvrdenie termínu</div>

            <div class="text-body1 q-mb-lg">Naozaj sa chcete prihlásiť na vybraný termín?</div>

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="Zrušiť" color="grey-7" @click="showAlert = false" />
              <q-btn unelevated color="primary" label="Vybrať termín" @click="handleSignDate" />
            </div>
          </q-card>
        </q-dialog>

        <q-dialog v-model="showInfo" persistent transition-show="scale" transition-hide="scale">
          <q-card class="q-pa-xl bg-gray" style="min-width: 400px; max-width: 90vw">
            <div class="text-h6 q-mb-md">Informácia</div>

            <div class="text-body1 q-mb-lg">Termín bol úspešne vybraný.</div>

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="Zavrieť" color="grey-7" @click="showInfo = false" />
            </div>
          </q-card>
        </q-dialog>

        <!-- RIGHT SECTION – REVIEW & SUBMIT -->
        <div class="col-12 col-md-6">
          <div class="bg-grey-1 q-pa-md rounded-borders q-mb-lg">
            <div class="text-subtitle1 q-mb-sm"><b>Výber</b></div>

            <div class="text-body2 text-grey-8 q-mb-sm">
              <span v-if="selectedDate?.date === '' || selectedDate?.date == null">
                Ešte nemáte vybraný termín. Vyberte si z dostupných možností a kliknite na "Vybrať
                termín". <br /><br
              /></span>
              <span v-else>
                Váš termín vidíte v hornej časti. Ak si chcete termín zmeniť, vyberte z dostupných
                možností a kliknite na "Zmeniť termín".</span
              >
            </div>

            <div class="q-mt-md">
              <div class="text-subtitle2 text-grey-7">Vybraný:</div>

              <div v-if="clickedDate" class="text-body1 text-primary q-mt-xs mb-sm">
                {{ clickedDate?.date }} <br />
              </div>
              <div v-else class="bg-red-1 justify-center align-center text-center q-mt-xs mb-sm">
                -
              </div>
              <div v-if="clickedDate2" class="text-body1 text-primary q-mt-xs mb-sm">
                {{ clickedDate2?.date }}
              </div>
              <div v-else class="bg-red-1 justify-center align-center text-center q-mt-xs mb-sm">
                -
              </div>
            </div>
          </div>

          <q-btn
            :disable="clickedDate == null"
            :label="
              selectedDate?.date == null || selectedDate?.date === ''
                ? 'Vybrať termíny'
                : 'Zmeniť termíny'
            "
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
import { defineComponent } from 'vue';
import type { dateSelection } from '../components/models';
export default defineComponent({
  name: 'MainPage',

  data() {
    return {
      userId: null as number | null,
      selectedDate: null as dateSelection | null,
      dates2: [] as dateSelection[],
      clickedDate: null as dateSelection | null,
      showAlert: false,
      showInfo: false,
      clickedDate2: null as dateSelection | null,
      selectedDate2: null as dateSelection | null,
      userEmail: sessionStorage.getItem('email') || '',
      displayEmailChangePopup: false,
      emailInput: '' as string,
      emailError: false as boolean,
      emailErrorMessage: '' as string,
      showCustomAlert: false as boolean,
      customAlertMessage: '' as string,
      allDates: [] as dateSelection[],
      openDay: null as string | null,
    };
  },

  created() {
    const id = sessionStorage.getItem('userId');
    this.userId = Number(id);
  },

  methods: {
    toggleDay(day: string) {
      this.openDay = this.openDay === day ? null : day;
    },
    createAlert(text: string) {
      this.showCustomAlert = true;
      this.customAlertMessage = text;
    },
    saveEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(this.emailInput)) {
        this.emailError = true;

        this.emailErrorMessage = 'Zadajte platnú emailovú adresu.';
        return;
      }
      this.emailError = false;
      this.emailErrorMessage = '';
      this.userEmail = this.emailInput;
      sessionStorage.setItem('email', this.userEmail);
      this.displayEmailChangePopup = false;
      fetch('https://backendday.vercel.app/api/saveEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: this.userId,
          email: this.userEmail,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.success) {
            alert('Chyba pri ukladaní emailu. Skúste to znova.');
          }
        })
        .catch((error) => {
          console.error('Error saving email:', error);
        });
    },
    selectDate(d: dateSelection) {
      this.clickedDate2 = null;
      if (this.clickedDate == d) {
        this.clickedDate = null;

        return;
      }
      this.clickedDate = d;
      this.dates2 = this.allDates.filter((date) => {
        if (!this.clickedDate) return false;

        const clicked = new Date(this.clickedDate.raw!);
        const other = new Date(date.raw!);

        const clickedDay = new Date(clicked.getFullYear(), clicked.getMonth(), clicked.getDate());
        const otherDay = new Date(other.getFullYear(), other.getMonth(), other.getDate());

        const diffInDays = (otherDay.getTime() - clickedDay.getTime()) / (1000 * 60 * 60 * 24);

        return diffInDays === 8 && date.block === this.clickedDate.block;
      });
    },
    selectDate2(d: dateSelection) {
      if (this.clickedDate2 == d) {
        this.clickedDate2 = null;
        return;
      }
      this.clickedDate2 = d;
    },

    formatDate(rawDate: string, withTime: boolean = true) {
      const d = new Date(rawDate);
      if (!withTime) {
        return d.toLocaleDateString('sk-SK', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
      }
      return d.toLocaleDateString('sk-SK', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    handleDateSelection() {
      this.showAlert = true;
    },
    handleSignDate() {
      this.showAlert = false;

      if (!this.clickedDate || !this.userId) return;
      if (this.clickedDate2 == null) {
        this.createAlert('Je potrebné vybrať aj druhý termín.');
        return;
      }

      fetch('https://backendday.vercel.app/api/selectDate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: this.userId,
          dateid: this.clickedDate.id,
          dateid2: this.clickedDate2 ? this.clickedDate2.id : null,
          date2: this.clickedDate2 ? this.clickedDate2.raw : null,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            this.allDates = [];

            this.selectedDate = this.clickedDate;
            this.selectedDate2 = this.clickedDate2;
            this.clickedDate = null;
            this.clickedDate2 = null;
            this.getDates();
            this.showInfo = true;
            setTimeout(() => {
              this.showInfo = false;
            }, 5000);
          } else {
            this.createAlert('Chyba pri výbere dátumu. Skúste to znova.');
          }
        })
        .catch((error) => {
          console.error('Error selecting date:', error);
        });
      this.clickedDate = null;
      this.clickedDate2 = null;
    },

    getDates() {
      fetch('https://backendday.vercel.app/api/getDates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: this.userId,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data.dates)) {
            data.dates.sort(
              (a: { date: string }, b: { date: string }) =>
                new Date(a.date).getTime() - new Date(b.date).getTime(),
            );
          }
          this.allDates = data.dates.map((d: dateSelection) => ({
            id: d.id,
            date: this.formatDate(d.date),
            raw: d.date,
            block: d.block,
          })) as dateSelection[];
          console.log('All dates:');
          console.log(this.allDates);
          if (data.selectedDates) {
            this.selectedDate = {
              id: null,
              date: data.selectedDates.date1 ? this.formatDate(data.selectedDates.date1) : '',
              block: data.selectedDates.block1 ? data.selectedDates.block1 : 0,
            };
            this.selectedDate2 = {
              id: null,
              date: data.selectedDates.date2 ? this.formatDate(data.selectedDates.date2) : '',
              block: data.selectedDates.block2 ? data.selectedDates.block2 : 0,
            };
          }
        })
        .catch((error) => {
          console.error('Error fetching dates:', error);
        });
    },
  },

  mounted() {
    this.getDates();
  },
  computed: {
    groupedDates() {
      return this.allDates.reduce(
        (acc, item) => {
          const key = new Date(item.raw!).toISOString().split('T')[0];
          console.log(key);
          if (!acc[<string>key]) acc[<string>key] = [];
          acc[<string>key]!.push(item);
          console.log(acc);
          return acc;
        },
        {} as Record<string, dateSelection[]>,
      );
    },
  },
});
</script>

<style>
.q-item {
  white-space: normal !important;
}
.dates-scroll {
  transition: all 0.3s ease;
}
.expand-enter-active,
.expand-leave-active {
  transition:
    max-height 0.35s ease,
    opacity 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

.dates-wrap {
  overflow: hidden;
}
</style>

<template>
  <q-page padding class="bg-grey-2 flex justify-center items-start">
    <q-card
      flat
      class="q-pa-xl rounded-borders shadow-2 flex justify-center align-center app-card"
      style="width: 1200px; max-width: 1200px"
    >
      <div class="row q-col-gutter-xl items-start">
        <div class="col-12 col">
          <div class="row items-center q-mb-md">
            <q-avatar size="56px" class="user-badge bg-blue-1">
              <div class="user-id">{{ userId }}</div>
            </q-avatar>

            <div class="q-ml-md user-info">
              <div class="text-body1 text-grey-8">Prihlásený používateľ</div>
              <div class="text-subtitle1"><b>ID:</b> {{ userId }}</div>
              <div v-if="userEmail" class="user-email-row">
                <b>email:</b>
                <q-chip dense class="q-ml-sm" outline>{{ userEmail }}</q-chip>
                <q-icon
                  name="edit"
                  class="cursor-pointer q-ml-sm"
                  @click="displayEmailChangePopup = true"
                />
              </div>
              <div v-else class="text-grey-7">
                <b>Email: </b>
                <q-chip
                  dense
                  class="q-ml-sm bg-red-1 text-red-8 cursor-pointer"
                  @click="displayEmailChangePopup = true"
                  >Zadať email</q-chip
                >
              </div>
            </div>
          </div>
          <q-chip v-if="!userEmail"
            >Ak si prajete dostať potvrdenie o výbere termínov, vyplnte prosím email.</q-chip
          >

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
          <div class="q-gutter-sm selected-dates">
            <q-chip v-if="selectedDate?.date" dense color="green-1" text-color="green-8">{{
              selectedDate?.date
            }}</q-chip>
            <q-chip
              v-if="selectedDate2?.date"
              dense
              class="q-ml-sm"
              color="green-1"
              text-color="green-8"
              >{{ selectedDate2?.date }}</q-chip
            >
            <div v-if="!selectedDate?.date && !selectedDate2?.date" class="text-grey-7 q-mt-sm">
              Termíny neboli vybrané.
            </div>
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
        <div class="col-12 col-md-6 dates-scroll">
          <div class="text-h6 q-mb-sm">Dostupné termíny</div>
          <span>1. termín</span>
          <div v-if="allDates.length === 0" class="text-grey-7">Žiadne dostupné termíny.</div>
          <q-list bordered class="rounded-borders">
            <q-expansion-item
              v-for="(items, day) in filteredDays"
              :key="String(day)"
              :label="formatDate(String(day), false)"
              :value="openedExpansion === String(day)"
              @update:model-value="(val) => (openedExpansion = val ? String(day) : null)"
              icon="event"
              switch-toggle
              expand-separator
              dense
              @show="onDayOpened(String(day))"
              @hide="onDayClosed(String(day))"
            >
              <q-list padding>
                <q-item
                  v-for="item in visibleFirstTermItems(<dateSelection[]>items)"
                  :key="String(item.id)"
                  clickable
                  @click="selectDate(item)"
                  :active="clickedDate && clickedDate.id === item.id"
                  active-class="item-active"
                  class="rounded-borders q-my-xs date-item"
                >
                  <q-item-section avatar>
                    <q-icon name="schedule" />
                  </q-item-section>

                  <q-item-section>
                    <div class="date-main">{{ item.date }}</div>
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
                active-class="item-active"
                class="q-my-sm rounded-borders date-item"
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

              <div class="selected-preview q-mt-xs mb-sm">
                <q-chip v-if="clickedDate" color="primary" text-color="white">{{
                  clickedDate?.date
                }}</q-chip>
                <q-chip v-else dense outline>-</q-chip>
              </div>

              <div class="selected-preview q-mt-xs mb-sm">
                <q-chip v-if="clickedDate2" color="primary" text-color="white">{{
                  clickedDate2?.date
                }}</q-chip>
                <q-chip v-else dense outline>-</q-chip>
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
            class="full-width primary-btn"
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
      selectedDay: null as string | null,
      openedExpansion: null as string | null,
    };
  },

  created() {
    const id = sessionStorage.getItem('userId');
    this.userId = Number(id);
  },

  methods: {
    onDayClosed(day: string) {
      if (this.selectedDay === day) {
        this.selectedDay = null;
        this.clickedDate = null;
        this.clickedDate2 = null;
        this.dates2 = [];
      }
    },
    onDayOpened(day: string) {
      this.selectedDay = day;
      this.clickedDate = null;
      this.clickedDate2 = null;
      this.dates2 = [];
    },

    resetSecondDate() {
      this.clickedDate2 = null;
      this.clickedDate = null;
    },
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
    visibleFirstTermItems(items: dateSelection[]) {
      if (!this.clickedDate) return items;
      return items.filter((i) => i.id === this.clickedDate!.id);
    },
    selectDate(d: dateSelection) {
      this.clickedDate2 = null;

      this.selectedDay = new Date(d.raw!).toISOString().split('T')[0] || '';

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
            this.selectedDay = null;
            this.openedExpansion = null;
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
    filteredDays() {
      if (!this.selectedDay) return this.groupedDates;

      return {
        [this.selectedDay]: this.groupedDates[this.selectedDay],
      };
    },
  },
});
</script>

<style>
:root {
  --bg: #f7f9fc;
  --surface: #ffffff;
  --muted: #475569;
  --muted-2: #6b7280;
  --primary: #2563eb;
  --primary-weak: rgba(37, 99, 235, 0.06);
  --success: #059669;
  --danger: #dc2626;
  --border: #e6e9ef;
}

.app-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 255, 0.96));
  color: var(--muted);
  border: 1px solid var(--border);
  box-shadow: 0 12px 36px rgba(17, 24, 39, 0.06);
  border-radius: 14px;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 56px;
  padding: 0 10px;
  border-radius: 12px;
  font-weight: 700;
  color: var(--primary) !important;
  border: 1px solid rgba(37, 99, 235, 0.08);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.04);
  white-space: nowrap;
  overflow: hidden;
}

.user-id {
  font-size: clamp(12px, 1.05rem, 18px);
  line-height: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: calc(564x + 8ch);
  display: inline-block;
}

.selected-dates .q-chip {
  font-weight: 600;
  border-radius: 8px;
}

.dates-list {
  padding: 6px;
}
.date-item {
  cursor: pointer;
  transition:
    transform 0.14s ease,
    box-shadow 0.14s ease;
}
.date-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(16, 24, 40, 0.06);
}
.item-active {
  background: var(--primary-weak) !important;
  border: 1px solid rgba(37, 99, 235, 0.12) !important;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.06);
}
.date-main {
  font-weight: 600;
  color: var(--muted);
}

.dates-scroll {
  transition: all 0.28s ease;
}
.dates-wrap {
  overflow: hidden;
}

.selected-preview q-chip {
  margin-right: 8px;
}

.primary-btn {
  border-radius: 10px;
  box-shadow: 0 10px 26px rgba(37, 99, 235, 0.06);
}
.primary-btn:hover {
  transform: translateY(-2px);
}

.text-h6::after {
  content: '';
  display: block;
  width: 40px;
  height: 3px;
  margin-top: 8px;
  border-radius: 2px;
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.24), rgba(5, 150, 105, 0.14));
}

:focus {
  outline: 3px solid rgba(37, 99, 235, 0.1);
  outline-offset: 2px;
}

.q-item {
  white-space: normal !important;
}

.expand-enter-active,
.expand-leave-active {
  transition:
    max-height 0.32s ease,
    opacity 0.18s ease;
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
</style>

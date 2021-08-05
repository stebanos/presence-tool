<template>
  <b-table bordered :items="previewStudents" :fields="fields" style="/*width: fit-content*/" class="mod-presence">
    <template #head(period)="data">
      <div style="display: flex; gap: 5px;" :data-item="data.period">
        <div class="radio-tabs-default" :class="{'radio-tabs-active': options.display_selected === 'color-code'}">
          <input type="radio" name="choice-display" id="choice-color-code" value="color-code" class="sr-only" v-model="options.display_selected" />
          <label for="choice-color-code" class="radio-tabs">Color</label>
        </div>
        <div class="radio-tabs-default" :class="{'radio-tabs-active': options.display_selected === 'dropdown'}">
          <input type="radio" name="choice-display" id="choice-dropdown" value="dropdown" class="sr-only" v-model="options.display_selected" />
          <label for="choice-dropdown" class="radio-tabs">Dropdown</label>
        </div>
      </div>
    </template>
    <template #cell(period)="data">
      <template>
        <div style="display: flex; gap: 5px" v-if="display_color_code">
          <div v-for="(status, index) in presenceStatuses" :key="`status-${index}`" class="color-code" :class="[status.color, { 'is-selected': data.item.selected === status.id }]" @click="data.item.selected = status.id">{{ status.code }}</div>
        </div>
        <div v-if="display_dropdown">
          <select v-model="data.item.selected" class="form-control mod-select">
            <option v-for="(status, index) in presenceStatuses" :key="`status-${index}`" :value="status.id">{{ status.title }}</option>
          </select>
        </div>
      </template>
    </template>
    <template #head(period-result)="data">
      <div id="lbl" class="txt-truncate">{{data.label}}</div>
      <b-tooltip target="lbl" triggers="hover" placement="bottom">{{data.label}}</b-tooltip>
    </template>
    <template #cell(period-result)="data">
      <template>
        <div v-if="display_color_code" style="max-width: fit-content;margin: 0 auto"><div class="color-code" :class="[getStatusColorForStudent(data.item)]"><span>{{ getStatusCodeForStudent(data.item) }}</span></div></div>
        <div v-if="display_dropdown">{{ getStatusTitleForStudent(data.item) }}</div>
      </template>
    </template>
  </b-table>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PresenceStatus } from '../types';

type PreviewStudent = { name: string; selected: number; };

@Component({
  name: 'preview-entry'
})
export default class PreviewEntry extends Vue {
  
  readonly fields = [
    { key: 'name', sortable: false, label: 'Student' },
    { key: 'period', sortable: false, label: 'Presence 1', variant: 'period' },
    { key: 'period-result', sortable: false, label: 'Presence 1', variant: 'result' }
  ];
  
  @Prop({type: Array, required: true}) readonly presenceStatuses!: PresenceStatus[];
  @Prop({type: Array, required: true}) readonly previewStudents!: PreviewStudent[];
  @Prop({required: true}) readonly options!: { display_selected: string; };
  
  get display_color_code() : boolean {
    return this.options.display_selected === 'color-code';
  }

  get display_dropdown() : boolean {
    return this.options.display_selected === 'dropdown';
  }
  
  getStatusForStudent(statusId : number) : PresenceStatus|undefined {
    return this.presenceStatuses.find(s => s.id === statusId);
  }
  
  getStatusTitleForStudent(student: PreviewStudent) : string {
    return this.getStatusForStudent(student.selected)?.title || '';
  }

  getStatusCodeForStudent(student: PreviewStudent) : string {
    return this.getStatusForStudent(student.selected)?.code || '';
  }

  getStatusColorForStudent(student: PreviewStudent) : string {
    return this.getStatusForStudent(student.selected)?.color || '';
  }
}
</script>

<style>
.radio-tabs-default {
  background-color: rgba(255, 255, 255, .45);
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .05);
  color: #337ab7;
}
.radio-tabs-default:hover, .radio-tabs-default:focus {
  background-color: #fff;
  box-shadow: 0 1px 2px hsla(208, 55%, 25%, .10);
  color: #507177;
}
.radio-tabs {
  cursor: pointer;
  font-weight: normal;
  margin: 0;
  padding: 0 .5em;
}
.radio-tabs-active, .radio-tabs-active:hover, .radio-tabs-active:focus  {
  background-color: #fff;
  box-shadow: 0 1px 2px hsla(208, 55%, 25%, .40);
  color: #507177;
}
</style>
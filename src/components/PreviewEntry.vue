<template>
  <b-table bordered :items="previewStudents" :fields="fields" class="mod-presence mod-entry">
    <template #head(period)="data">
      <div class="u-flex u-gap-small" :data-item="data.period">
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
        <div class="u-flex u-gap-small u-flex-wrap" v-if="display_color_code">
          <button v-for="(status, index) in presenceStatuses" :key="`status-${index}`" class="color-code" :class="[status.color, { 'is-selected': data.item.selected === status.id }]" @click="data.item.selected = status.id" :aria-pressed="data.item.selected === status.id ? 'true': 'false'">{{ status.code }}</button>
        </div>
        <div v-if="display_dropdown">
          <select v-model="data.item.selected" class="form-control mod-select">
            <option v-for="(status, index) in presenceStatuses" :key="`status-${index}`" :value="status.id">{{ status.title }}</option>
          </select>
        </div>
      </template>
    </template>
    <template #head(period-result)="data">
      <div id="lbl" class="u-txt-truncate">{{data.label}}</div>
      <b-tooltip target="lbl" triggers="hover" placement="bottom">{{data.label}}</b-tooltip>
    </template>
    <template #cell(period-result)="data">
      <template>
        <div v-if="display_color_code" class="result-wrap">
          <div class="color-code" :class="[getStatusColorForStudent(data.item)]">
            <span>{{ getStatusCodeForStudent(data.item) }}</span>
          </div>
        </div>
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

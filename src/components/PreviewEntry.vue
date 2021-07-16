<template>
  <b-table bordered :items="previewStudents" :fields="fields" style="/*width: fit-content*/" class="mod-presence">
    <template #head(period)="data">
      <div style="display: flex; gap: 5px;" :data-item="data.period">
        <div class="radio-tabs-default" :class="{'radio-tabs-active': options.display_selected === 'color'}">
          <input type="radio" name="choice-display" id="choice-color" value="color" class="sr-only" v-model="options.display_selected" />
          <label for="choice-color" class="radio-tabs">Color</label>
        </div>
        <div class="radio-tabs-default" :class="{'radio-tabs-active': options.display_selected === 'color-code'}">
          <input type="radio" name="choice-display" id="choice-color-code" value="color-code" class="sr-only" v-model="options.display_selected" />
          <label for="choice-color-code" class="radio-tabs">Color/Label</label>
        </div>
        <div class="radio-tabs-default" :class="{'radio-tabs-active': options.display_selected === 'code'}">
          <input type="radio" name="choice-display" id="choice-code" value="code" class="sr-only" v-model="options.display_selected" />
          <label for="choice-code" class="radio-tabs">Label</label>
        </div>
        <div class="radio-tabs-default" :class="{'radio-tabs-active': options.display_selected === 'dropdown'}">
          <input type="radio" name="choice-display" id="choice-dropdown" value="dropdown" class="sr-only" v-model="options.display_selected" />
          <label for="choice-dropdown" class="radio-tabs">Dropdown</label>
        </div>
      </div>
    </template>
    <template #cell(period)="data">
      <template>
        <div style="display: flex; gap: 5px" v-if="display_color">
          <div v-for="(status, index) in presenceStatuses" :key="`status-${index}`" class="color" :class="{ 'selected': data.item.selected === status.id }" style="width: 30px" :style="{'background-color': status.color}" @click="data.item.selected = status.id"></div>
        </div>
        <div style="display: flex; gap: 5px" v-if="display_code">
          <button v-for="(status, index) in presenceStatuses" :key="`status-${index}`" class="btn-code" :class="{ 'selected': data.item.selected === status.id }" @click="data.item.selected = status.id">{{ status.code }}</button>
        </div>
        <div style="display: flex; gap: 5px" v-if="display_color_code">
          <div v-for="(status, index) in presenceStatuses" :key="`status-${index}`" class="color-code" :class="{ 'selected': data.item.selected === status.id }" :style="{'background-color': status.color}" @click="data.item.selected = status.id"><span>{{ status.code }}</span></div>
        </div>
        <div v-if="display_dropdown">
          <select v-model="data.item.selected" class="form-control mod-select">
            <option v-for="(status, index) in presenceStatuses" :key="`status-${index}`" :value="status.id">{{ status.title }}</option>
          </select>
        </div>
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
    { key: 'period', sortable: false, label: 'Presence 1' }
  ];
  
  @Prop({type: Array, required: true}) readonly presenceStatuses!: PresenceStatus[];
  @Prop({type: Array, required: true}) readonly previewStudents!: PreviewStudent[];
  @Prop({required: true}) readonly options!: { display_selected: string; };
  
  get display_color() : boolean {
    return this.options.display_selected === 'color';
  }
  
  get display_code() : boolean {
    return this.options.display_selected === 'code';
  }

  get display_color_code() : boolean {
    return this.options.display_selected === 'color-code';
  }

  get display_dropdown() : boolean {
    return this.options.display_selected === 'dropdown';
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
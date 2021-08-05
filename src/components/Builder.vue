<template>
  <div @click="selectedStatus = null">
    <b-table bordered :foot-clone="createNew" :items="presenceStatuses" :fields="fields" style="margin-bottom:0;width: fit-content" class="mod-presence mod-builder" :class="{'is-changes-disabled': createNew}" :tbody-tr-class="rowClass">
      <template #cell(code)="status">
        <div @click.stop="selectedStatus = status.item"><b-input type="text" v-model="status.item.code" :disabled="createNew" style="width: 50px" class="mod-input" @input="onInput(status.item)"/></div>
      </template>
      <template #cell(title)="status">
        <div @click.stop="selectedStatus = status.item">
        <template v-if="status.item.type === 'fixed'">{{ status.item.title }}</template>
        <b-input v-else type="text" v-model="status.item.title" :disabled="createNew" class="mod-input" @input="onInput(status.item)" /></div>
      </template>
      <template #cell(meaning)="status">
          <div @click.stop="selectedStatus = status.item"><span v-if="!status.item.aliasses">{{ status.item.title }}</span>
          <template v-else>
            <span v-if="status.item.type === 'fixed'">
              {{ statusDefaults.find(s => s.id === status.item.aliasses).title }}
            </span>
            <select v-else class="form-control mod-select" :disabled="createNew" @change="onInput(status.item)">
              <option v-for="(statusDefault, index) in statusDefaults" :key="`fs-${index}`" :value="statusDefault.id" :selected="status.item.aliasses === statusDefault.id">{{ statusDefault.title }}</option>
            </select>
          </template></div>
      </template>
      <template #cell(color)="status">
        <div @click.stop="selectedStatus = status.item">
        <div :id="`color-${status.index}`" class="color" style="transition: opacity 200ms" :style="createNew ? 'cursor: not-allowed;opacity: .4': ''" :class="[status.item.color]" :disabled="createNew"></div>
        <b-popover :target="`color-${status.index}`" triggers="hover" placement="right">
          <div style="display:grid;grid-template-columns: repeat(10, 1fr);padding: 2px; grid-gap: 2px;">
            <template v-for="variant in [100, 300, 500, 700, 900]">
              <template v-for="color in ['pink', 'blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 'deep-orange']">
                <button :class="[`color ${color}-${variant}`, {'is-selected': status.item.color === `${color}-${variant}`}]" :key="`color--${color}-${variant}`" style="width:20px;z-index:1000" @click.stop="setColorForItem(status.item, `${color}-${variant}`)"></button>
              </template>
            </template>
          </div>
        </b-popover>
  </div>
      </template>
      <template #cell(actions)="status">
        <div>
          <div style="display: flex; gap: 5px;">
            <button class="btn btn-default btn-sm mod-presence" :disabled="createNew || status.index === 0" @click.stop="onMoveUp(status)" :id="`btn-up-${status.index}`">
              <i class="fa fa-arrow-up" aria-hidden="true"></i>
              <span class="sr-only">Move up</span>
            </button>
            <button class="btn btn-default btn-sm mod-presence" :disabled="createNew || status.index >= presenceStatuses.length - 1"  @click.stop="onMoveDown(status)" :id="`btn-down-${status.index}`">
              <i class="fa fa-arrow-down" aria-hidden="true"></i>
              <span class="sr-only">Move down</span>
            </button>
            <button :disabled="createNew || status.item.type === 'fixed'" class="btn btn-default btn-sm mod-presence" @click.stop="$emit('remove', status.item)">
              <i class="fa fa-minus-circle" aria-hidden="true"></i>
              <span class="sr-only">Delete</span>
            </button>
          </div>
        </div>
      </template>
      <template #foot(code)="">
        <input type="text" style="width: 50px" class="form-control mod-input" id="new-presence-code" v-model="codeNew" />
      </template>
      <template #foot(title)="">
        <b-input type="text" class="mod-input" v-model="titleNew" />
      </template>
      <template #foot(meaning)="">
        <select class="form-control mod-select" v-model="aliasNew">
          <option value="0">Choose meaning...</option>
          <option v-for="(statusDefault, index) in statusDefaults" :key="`fs-${index}`" :value="statusDefault.id">{{ statusDefault.title }}</option>
        </select>
      </template>
      <template #foot(color)="">
        <div class="color" :class="colorNew" id="color-new"></div>
        <b-popover :target="`color-new`" triggers="hover" placement="right">
          <div style="display:grid;grid-template-columns: repeat(10, 1fr);padding: 2px; grid-gap: 2px;">
            <template v-for="variant in [100, 300, 500, 700, 900]">
              <template v-for="color in ['pink', 'blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 'deep-orange']">
                <button :class="[`color ${color}-${variant}`, {'is-selected': colorNew === `${color}-${variant}`}]" :key="`color--${color}-${variant}`" style="width:20px;z-index:1000" @click="colorNew = `${color}-${variant}`"></button>
              </template>
            </template>
          </div>
        </b-popover>
      </template>
      <template #foot(actions)="">
        <div>
          <div style="display: flex; gap: 5px;">
            <button class="btn btn-default btn-sm mod-presence" @click="onSaveNew" style="" :disabled="!(codeNew && titleNew && aliasNew > 0)">
              <i class="fa fa-check-circle" aria-hidden="true"></i>
              <span class="sr-only">Save</span>
            </button>
            <button class="btn btn-default btn-sm mod-presence" @click="onCancelNew" style="">
              <i class="fa fa-minus-circle" aria-hidden="true" style="color:red"></i>
              <span class="sr-only">Cancel</span>
            </button>
          </div>
        </div>
      </template>
    </b-table>
    <button v-if="!createNew" class="btn btn-primary" style="margin-top: 10px" @click="onCreateNew"><i class="fa fa-plus" style="font-size: 13px;margin-right:5px"></i> New presence status</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PresenceStatus } from '../types';

const DEFAULT_COLOR_NEW = 'yellow-100';

@Component({
  name: 'builder'
})
export default class Builder extends Vue {
  readonly fields = [
    { key: 'code', sortable: false, label: 'Label' },
    { key: 'title', sortable: false },
    { key: 'meaning', sortable: false },
    { key: 'color', sortable: false },
    { key: 'actions', sortable: false, label: '', variant: 'actions' }
  ];
  
  createNew = false;
  codeNew = '';
  titleNew = '';
  aliasNew = 0;
  colorNew = DEFAULT_COLOR_NEW;
  
  selectedStatus: PresenceStatus|null = null;
  
  @Prop({type: Array, required: true}) readonly presenceStatuses!: PresenceStatus[];
  @Prop({type: Array, required: true}) readonly statusDefaults!: PresenceStatus[];
  
  onCreateNew() {
    this.createNew = true;
    this.$nextTick(() => {
      document.getElementById('new-presence-code')?.focus();
    });
  }
  
  onSaveNew() {
    this.$emit('create', { code: this.codeNew, title: this.titleNew, aliasses: this.aliasNew, color: this.colorNew });
    this.resetNew();
  }
  
  onCancelNew() {
    this.resetNew();
  }
  
  onMoveDown(status: any) {
    this.$emit('move-down', status.index);
    this.$nextTick(() => {
      let el : HTMLButtonElement|null = document.querySelector(`#btn-down-${status.index + 1}`);
      if (el?.disabled) {
        el = el?.previousSibling as HTMLButtonElement;
      }
      el?.focus();
    });
  }

  onMoveUp(status: any) {
    this.$emit('move-up', status.index);
    this.$nextTick(() => {
      let el : HTMLButtonElement|null = document.querySelector(`#btn-up-${status.index - 1}`);
      if (el?.disabled) {
        el = el?.nextSibling as HTMLButtonElement;
      }
      el?.focus();
    });
  }
  
  onInput(status: PresenceStatus) {
    console.log(status);
  }
  
  resetNew() {
    this.createNew = false;
    this.codeNew = '';
    this.titleNew = '';
    this.aliasNew = 0;
    this.colorNew = DEFAULT_COLOR_NEW;
  }
  setColorForItem(item: PresenceStatus, color: string) {
    if (item.color !== color) {
      item.color = color;
      this.onInput(item);
    }
  }
  
  rowClass(item, type) : string {
    if (!item || type !== 'row') { return ''; }
    if (item === this.selectedStatus) { return 'is-selected'; }
  }
}
</script>
<style scoped>
th, td {
  padding: 2px 4px;
}
th {
  text-align: left;
}
.btn.mod-presence {
  font-size: 14px;
  padding: 2px 5px;
  color: #4d88b3;
  width: 25px;
}
.btn.mod-presence:not(:disabled) .fa-check-circle {
  color: limegreen;
}
</style>
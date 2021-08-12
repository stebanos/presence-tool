<template>
  <div @click.stop="selectedStatus = null">
    <b-table bordered :foot-clone="createNew" :items="presenceStatuses" :fields="fields" class="mod-presence mod-builder" :class="{'is-changes-disabled': createNew}" :tbody-tr-class="rowClass">
      <template #cell(code)="status">
        <div class="cell-pad" @click.stop="onSelectStatus(status.item)"><b-input type="text" v-model="status.item.code" autocomplete="off" :disabled="createNew" class="mod-input mod-small" @focus="onSelectStatus(status.item)" /></div>
      </template>
      <template #cell(title)="status">
        <div class="cell-pad" @click.stop="onSelectStatus(status.item)">
          <template v-if="status.item.type === 'fixed'"><span style="line-height: 26px">{{ status.item.title }}</span></template>
          <b-input v-else type="text" v-model="status.item.title" autocomplete="off" :disabled="createNew" class="mod-input" @focus="onSelectStatus(status.item)" />
        </div>
      </template>
      <template #cell(meaning)="status">
        <div class="cell-pad" style="line-height: 26px" @click.stop="onSelectStatus(status.item)">
          <span v-if="!status.item.aliasses">{{ status.item.title }}</span>
          <template v-else>
            <span v-if="status.item.type === 'fixed'">
              {{ statusDefaults.find(s => s.id === status.item.aliasses).title }}
            </span>
            <select v-else class="form-control mod-select" :disabled="createNew" @focus="onSelectStatus(status.item)">
              <option v-for="(statusDefault, index) in statusDefaults" :key="`fs-${index}`" :value="statusDefault.id" :selected="status.item.aliasses === statusDefault.id">{{ statusDefault.title }}</option>
            </select>
          </template>
        </div>
      </template>
      <template #cell(color)="status">
        <div class="u-flex cell-pad" style="align-items: center; height: 42px;" @click.stop="onSelectStatus(status.item)">
          <button :id="`color-${status.index}`" class="color" :class="[{'is-selected': status.item === selectedStatus}, status.item.color]" :disabled="createNew" @focus="onSelectStatus(status.item)"></button>
          <color-picker :target="`color-${status.index}`" triggers="click blur" placement="right" :selected-color="status.item.color" @color-selected="setColorForItem(status.item, $event)"></color-picker>
        </div>
      </template>
      <template #cell(actions)="status">
        <div class="u-flex actions-wrap">
          <div class="u-flex u-gap-small actions-wrap-2">
            <button class="btn btn-default btn-sm mod-presence" :disabled="createNew || status.index === 0" @click.stop="onMoveUp(status)" :id="`btn-up-${status.index}`" @focus="onSelectStatus(status.item)">
              <i class="fa fa-arrow-up" aria-hidden="true"></i>
              <span class="sr-only">Move up</span>
            </button>
            <button class="btn btn-default btn-sm mod-presence" :disabled="createNew || status.index >= presenceStatuses.length - 1"  @click.stop="onMoveDown(status)" :id="`btn-down-${status.index}`" @focus="onSelectStatus(status.item)">
              <i class="fa fa-arrow-down" aria-hidden="true"></i>
              <span class="sr-only">Move down</span>
            </button>
            <button :disabled="createNew || status.item.type === 'fixed'" class="btn btn-default btn-sm mod-presence" @click.stop="$emit('remove', status.item)" @focus="onSelectStatus(status.item)">
              <i class="fa fa-minus-circle" aria-hidden="true"></i>
              <span class="sr-only">Delete</span>
            </button>
          </div>
        </div>
      </template>
      <template #foot(code)="">
        <input type="text" class="form-control mod-input mod-small" id="new-presence-code" v-model="codeNew" />
      </template>
      <template #foot(title)="">
        <b-input type="text" class="mod-input" v-model="titleNew" />
      </template>
      <template #foot(meaning)="">
        <select class="form-control mod-select" v-model="aliasNew">
          <option v-for="(statusDefault, index) in statusDefaults" :key="`fs-${index}`" :value="statusDefault.id">{{ statusDefault.title }}</option>
        </select>
      </template>
      <template #foot(color)="">
        <div class="u-flex">
          <button class="color" :class="colorNew" id="color-new"></button>
          <color-picker target="color-new" triggers="click blur" placement="right" :selected-color="colorNew" @color-selected="colorNew = $event"></color-picker>
        </div>
      </template>
      <template #foot(actions)="">
        <div class="actions-wrap">
          <div class="actions-wrap-2">
            <button class="btn btn-default btn-sm mod-presence" @click.stop="onSaveNew" :disabled="!(codeNew && titleNew && aliasNew > 0)">
              <i class="fa fa-check-circle" aria-hidden="true"></i>
              <span class="sr-only">Save</span>
            </button>
            <button class="btn btn-default btn-sm mod-presence mod-cancel" @click.stop="onCancelNew">
              <i class="fa fa-minus-circle" aria-hidden="true"></i>
              <span class="sr-only">Cancel</span>
            </button>
          </div>
        </div>
      </template>
    </b-table>
    <div style="margin-top: 10px" v-if="!createNew">
      <button class="btn btn-sm mod-presence-new" @click="onCreateNew"><i class="fa fa-plus" aria-hidden="true"></i> New presence status</button>
    </div>
    <div style="margin-top: 10px" v-if="!createNew">
      <button class="btn btn-primary mod-presence-save">Save</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PresenceStatus } from '../types';
import ColorPicker from './ColorPicker.vue';

const DEFAULT_COLOR_NEW = 'yellow-100';

@Component({
  name: 'builder',
  components: { ColorPicker }
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
  aliasNew = 3;
  colorNew = DEFAULT_COLOR_NEW;
  
  selectedStatus: PresenceStatus|null = null;
  
  @Prop({type: Array, required: true}) readonly presenceStatuses!: PresenceStatus[];
  @Prop({type: Array, required: true}) readonly statusDefaults!: PresenceStatus[];
  
  onSelectStatus(status: PresenceStatus) {
    if (!this.createNew) {
      this.selectedStatus = status;
    }
  }
  
  onCreateNew() {
    this.createNew = true;
    this.selectedStatus = null;
    this.$nextTick(() => {
      document.getElementById('new-presence-code')?.focus();
    });
  }
  
  onSaveNew() {
    this.$emit('create', { code: this.codeNew, title: this.titleNew, aliasses: this.aliasNew, color: this.colorNew });
    this.resetNew();
    this.$nextTick(() => {
      this.selectedStatus = this.presenceStatuses[this.presenceStatuses.length - 1];
    });
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
  
  resetNew() {
    this.createNew = false;
    this.codeNew = '';
    this.titleNew = '';
    this.aliasNew = 3;
    this.colorNew = DEFAULT_COLOR_NEW;
  }
  
  setColorForItem(item: PresenceStatus, color: string) {
    if (item.color !== color) {
      item.color = color;
    }
  }
  
  rowClass(item: PresenceStatus) : string {
    if (item === this.selectedStatus) { return 'is-selected'; }
    return '';
  }
}
</script>

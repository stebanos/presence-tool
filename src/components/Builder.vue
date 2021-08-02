<template>
  <div>
    <b-table bordered :foot-clone="createNew" :items="presenceStatuses" :fields="fields" style="margin-bottom:0;width: fit-content" class="mod-presence" :class="{'is-changes-disabled': createNew}">
      <template #cell(code)="status">
        <input type="text" v-model="status.item.code" :disabled="createNew" style="width: 50px" class="form-control mod-input" />
      </template>
      <template #cell(title)="status">
        <template v-if="status.item.type === 'fixed'">{{ status.item.title }}</template>
        <input v-else type="text" v-model="status.item.title" :disabled="createNew" class="form-control mod-input" />
      </template>
      <template #cell(meaning)="status">
          <span v-if="!status.item.aliasses" style="color: #999">{{ status.item.title }}</span>
          <template v-else>
            <span v-if="status.item.type === 'fixed'">
              {{ statusDefaults.find(s => s.id === status.item.aliasses).title }}
            </span>
            <select v-else class="form-control mod-select" :disabled="createNew">
              <option v-for="(statusDefault, index) in statusDefaults" :key="`fs-${index}`" :value="statusDefault.id" :selected="status.item.aliasses === statusDefault.id">{{ statusDefault.title }}</option>
            </select>
          </template>
      </template>
      <template #cell(color)="status">
        <div class="color" :style="{'background-color': status.item.color}"></div>
      </template>
      <template #cell(actions)="status">
        <div style="display: flex; gap: 5px;">
          <button class="btn btn-default btn-sm mod-presence" :disabled="createNew || status.index === 0" @click="$emit('moved-up', status.index)">
            <i class="fa fa-arrow-up" aria-hidden="true"></i>
            <span class="sr-only">Move up</span>
          </button>
          <button class="btn btn-default btn-sm mod-presence" :disabled="createNew || status.index >= presenceStatuses.length - 1"  @click="$emit('moved-down', status.index)">
            <i class="fa fa-arrow-down" aria-hidden="true"></i>
            <span class="sr-only">Move down</span>
          </button>
          <button v-if="status.item.type !== 'fixed'" :disabled="createNew" class="btn btn-default btn-sm mod-presence">
            <i class="fa fa-minus-circle" aria-hidden="true"></i>
            <span class="sr-only">Delete</span>
          </button>
        </div>
      </template>
      <template #foot(code)="">
        <input type="text" style="width: 50px" class="form-control mod-input" id="new-presence-code" />
      </template>
      <template #foot(title)="">
        <input type="text" class="form-control mod-input" />
      </template>
      <template #foot(meaning)="">
        <select class="form-control mod-select">
          <option v-for="(statusDefault, index) in statusDefaults" :key="`fs-${index}`" :value="statusDefault.id">{{ statusDefault.title }}</option>
        </select>
      </template>
      <template #foot(color)="">
        <div class="color" :style="{'background-color': 'yellow'}"></div>
      </template>
      <template #foot(actions)="">
        <div style="display: flex; gap: 5px;">
          <button class="btn btn-default btn-sm mod-presence" @click="onSaveNew" style="">
            <i class="fa fa-check-circle" aria-hidden="true" style="color: limegreen"></i>
            <span class="sr-only">Save</span>
          </button>
          <button class="btn btn-default btn-sm mod-presence" @click="onCancelNew" style="">
            <i class="fa fa-minus-circle" aria-hidden="true" style="color:red"></i>
            <span class="sr-only">Cancel</span>
          </button>
        </div>
      </template>
    </b-table>
    <button v-if="!createNew" class="btn btn-primary" style="margin-top: 10px" @click="onCreateNew"><i class="fa fa-plus" style="font-size: 13px;margin-right:5px"></i> New presence status</button>
    <!--<div style="background:pink;display:flex">
      <input type="text" style="width: 50px" class="form-control mod-input" />
      <input type="text" class="form-control mod-input" />
      <select class="form-control mod-select">
        <option v-for="(statusDefault, index) in statusDefaults" :key="`fs-${index}`" :value="statusDefault.id">{{ statusDefault.title }}</option>
      </select>
    </div>-->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PresenceStatus } from '../types';

@Component({
  name: 'builder'
})
export default class Builder extends Vue {
  readonly fields = [
    { key: 'code', sortable: false, label: 'Label' },
    { key: 'title', sortable: false },
    { key: 'meaning', sortable: false },
    { key: 'color', sortable: false },
    { key: 'actions', sortable: false, label: '' }
  ];
  
  createNew = false;
  
  @Prop({type: Array, required: true}) readonly presenceStatuses!: PresenceStatus[];
  @Prop({type: Array, required: true}) readonly statusDefaults!: PresenceStatus[];
  
  onCreateNew() {
    this.createNew = true;
    this.$nextTick(() => {
      document.getElementById('new-presence-code').focus();
    });
  }
  onSaveNew() {
    this.createNew = false;
  }
  onCancelNew() {
    this.createNew = false;
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
</style>
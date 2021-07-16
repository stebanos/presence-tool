<template>
  <div>
    <b-table bordered :items="presenceStatuses" :fields="fields" style="margin-bottom:0;width: fit-content" class="mod-presence">
      <template #cell(code)="status">
        <input type="text" v-model="status.item.code" style="width: 50px" class="form-control mod-input" />
      </template>
      <template #cell(title)="status">
        <template v-if="status.item.type === 'fixed'">{{ status.item.title }}</template>
        <input v-else type="text" v-model="status.item.title" class="form-control mod-input" />
      </template>
      <template #cell(meaning)="status">
          <span v-if="!status.item.aliasses" style="color: #999">{{ status.item.title }}</span>
          <template v-else>
            <span v-if="status.item.type === 'fixed'">
              {{ statusDefaults.find(s => s.id === status.item.aliasses).title }}
            </span>
            <select v-else class="form-control mod-select">
              <option v-for="(statusDefault, index) in statusDefaults" :key="`fs-${index}`" :value="statusDefault.id" :selected="status.item.aliasses === statusDefault.id">{{ statusDefault.title }}</option>
            </select>
          </template>
      </template>
      <template #cell(color)="status">
        <div class="color" :style="{'background-color': status.item.color}"></div>
      </template>
      <template #cell(actions)="status">
        <div style="display: flex; gap: 5px;">
          <button class="btn btn-default btn-sm mod-presence" :disabled="status.index === 0" @click="$emit('moved-up', status.index)">
            <i class="fa fa-arrow-up" aria-hidden="true"></i>
            <span class="sr-only">Move up</span>
          </button>
          <button class="btn btn-default btn-sm mod-presence" :disabled="status.index >= presenceStatuses.length - 1"  @click="$emit('moved-down', status.index)">
            <i class="fa fa-arrow-down" aria-hidden="true"></i>
            <span class="sr-only">Move down</span>
          </button>
          <button v-if="status.item.type !== 'fixed'" class="btn btn-default btn-sm mod-presence">
            <i class="fa fa-trash" aria-hidden="true"></i>
            <span class="sr-only">Delete</span>
          </button>
        </div>
      </template>
    </b-table>
    <button class="btn btn-primary" style="margin-top: 10px"><i class="fa fa-plus" style="font-size: 13px;margin-right:5px"></i> New presence status</button>
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
  
  @Prop({type: Array, required: true}) readonly presenceStatuses!: PresenceStatus[];
  @Prop({type: Array, required: true}) readonly statusDefaults!: PresenceStatus[];
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
}
</style>
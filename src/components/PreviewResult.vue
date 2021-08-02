<template>
  <b-table bordered :items="previewStudents" :fields="fields" style="width: fit-content" class="mod-presence">
    <template #cell(period)="data">
      <template>
        <div v-if="display_color" class="color" :class="[getStatusColorForStudent(data.item)]"></div>
        <div v-if="display_color_code" style="max-width: fit-content"><div class="color-code" :class="[getStatusColorForStudent(data.item)]"><span>{{ getStatusCodeForStudent(data.item) }}</span></div></div>
        <div v-if="display_code" class="btn-code">{{ getStatusCodeForStudent(data.item) }}</div>
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
  name: 'preview-result'
})
export default class PreviewResult extends Vue {
  readonly fields = [
    { key: 'name', sortable: false, label: 'Student', variant: 'name' },
    { key: 'period', sortable: false, label: 'Presence 1' }
  ];
  
  @Prop({type: Array, required: true}) readonly presenceStatuses!: PresenceStatus[];
  @Prop({type: Array, required: true}) readonly previewStudents!: PreviewStudent[];
  @Prop({type: String, required: true}) readonly displaySelected!: string;
  
  get display_color() : boolean {
    return this.displaySelected === 'color';
  }
  
  get display_code() : boolean {
    return this.displaySelected === 'code';
  }

  get display_color_code() : boolean {
    return this.displaySelected === 'color-code';
  }

  get display_dropdown() : boolean {
    return this.displaySelected === 'dropdown';
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
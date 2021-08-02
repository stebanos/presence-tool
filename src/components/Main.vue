<template>
  <div v-if="presence">
    <div style="background-color: #2b6597;padding: 20px 15px;border-bottom: 1px solid #14578f">
      <h1 style="margin: 0;color: #fff;font-size: 2.2rem">{{ presence.title }}</h1>
    </div>
    <div v-if="tab === 'builder'" style="display: flex;margin-top:25px; margin-left: 20px; gap:60px;align-items:baseline;flex-flow:wrap;margin-bottom: 20px">
      <div class="presence-builder">
        <h2 class="presence-header">Builder</h2>
        <builder :presence-statuses="orderedPresenceStatuses" :status-defaults="fixedStatusDefaults" @moved-up="onMovedUp" @moved-down="onMovedDown"></builder>
      </div>
      <div style="display: flex;gap:60px;align-items:baseline;flex:1;flex-flow:wrap;margin-bottom: 20px">
      <div>
        <h2 class="presence-header">Preview Entry 'Presence 1'</h2>
        <preview-entry :presence-statuses="orderedPresenceStatuses" :preview-students="preview_students" :options="preview_options"></preview-entry>
      </div>
      <div>
        <h2 class="presence-header">Preview Result</h2>
        <preview-result :presence-statuses="orderedPresenceStatuses" :preview-students="preview_students" :display-selected="preview_options.display_selected"></preview-result>
      </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PresenceStatus, ExtraStatus, Presence } from '../types';
import APIConfig from '../connect/APIConfig';
import Connector from '../connect/Connector';
import Builder from './Builder.vue';
import PreviewEntry from './PreviewEntry.vue';
import PreviewResult from './PreviewResult.vue';

@Component({
  components: { Builder, PreviewEntry, PreviewResult }
})
export default class Main extends Vue {
  // eslint-disable-next-line
  pdata: any = {};
  connector: Connector|null = null;
  presence: Presence|null = null;
  tab = 'builder';
  
  readonly preview_options = {
    display_selected: 'color-code'
  };
  
  readonly preview_students = [
    { name: 'Student 1', selected: 3 }, 
    { name: 'Student 2', selected: 3 }, 
    { name: 'Student 3', selected: 3 }, 
    { name: 'Student 4', selected: 1 }, 
    { name: 'Student 5', selected: 1 }
  ];

  @Prop({type: APIConfig, required: true}) readonly apiConfig!: APIConfig;

  async load() : Promise<void> {
    if (!this.connector) { return; }
    
    this.pdata = {
      students: await this.connector.loadStudents(),
      status_defaults: await this.connector.loadStatusDefaults(),
      presences: await this.connector.loadPresences()
    };
    
    if (this.pdata.presences.length) {
      this.presence = this.pdata.presences[0];
    }
  }
  
  get fixedStatusDefaults() : PresenceStatus[] {
    if (!this.pdata.status_defaults) { return []; }
    return this.pdata.status_defaults.filter((s : PresenceStatus) => !s.aliasses);
  }
  
  get presenceStatuses() : PresenceStatus[] {
    if (!this.presence || !this.presence.metadata) { return []; }

    const statuses : PresenceStatus[] = [].concat(this.pdata.status_defaults);
    const extraStatuses : ExtraStatus[] = this.presence.metadata.statuses;
    extraStatuses.forEach(status => {
      if (status['ref-id']) {
        const s = statuses.find(s => s.id === status['ref-id']);
        if (s && status['color']) {
          s.color = status['color'];
        }
        if (s && status['code']) {
          s.code = status['code'];
        }
      } else {
        statuses.push(status as unknown as PresenceStatus);
      }
    });
    return statuses;
  }
  
  get orderedPresenceStatuses() : PresenceStatus[] {
    if (!this.presence || !this.presence.metadata) { return []; }

    const presenceStatuses = this.presenceStatuses;
    return this.presence.metadata.order
      .map(i => presenceStatuses.find(s => s.id === i))
      .filter((status) : status is PresenceStatus => typeof status !== undefined);
  }
  
  onMovedUp(index: number) : void {
    if (!this.presence || !this.presence.metadata) { return; }
    if (index <= 0) { return; }

    const order = this.presence.metadata.order;
    this.presence.metadata.order = order.slice(0, index - 1).concat(order[index], order[index - 1]).concat(order.slice(index + 1));
  }
  
  onMovedDown(index: number) : void {
    if (!this.presence || !this.presence.metadata) { return; }

    const order = this.presence.metadata.order;
    if (index >= order.length - 1) { return; }
    this.presence.metadata.order = order.slice(0, index).concat(order[index + 1], order[index]).concat(order.slice(index + 2));
  }

  mounted() : void {
    this.connector = new Connector(this.apiConfig);
    this.load();
  }
}
</script>

<style>
.form-control.mod-input {
  height: initial;
  padding: 2px 5px;
}
.form-control.mod-select {
  height: initial;
  padding: 3px 5px;
  width: initial;
}
.table.mod-presence {
  border-top-color: #ebebeb;
}
.table.mod-presence thead {
  background-color: #f8fbfb;
}
.table.mod-presence th {
  color: #727879;
}
.table-bordered > thead > tr > th, .table-bordered > tbody > tr > th, .table-bordered > tfoot > tr > th, .table-bordered > thead > tr > td, .table-bordered > tbody > tr > td, .table-bordered > tfoot > tr > td {
  border: 1px solid #ebebeb;
}
.table.mod-presence tbody {
  background: linear-gradient(to bottom, #e3eaed 0, transparent 4px);
  transition: opacity 200ms linear;
}
.table.mod-presence tbody .form-control {
  transition: background 200ms linear;
}

.table.mod-presence > tbody > tr > td {
  vertical-align: middle;
}

.table.mod-presence > tfoot > tr > th {
  vertical-align: middle;
}

.table.mod-presence.is-changes-disabled tbody {
    opacity: .8;
}

.presence-header {
  margin: 0 0 25px 8px;color: #507177;font-size: 1.6rem;
}

.color {
  border: 1px solid transparent;
  border-radius: 3px;
  width: 40px;
  height: 16px;
  cursor: pointer;
}

.color.selected, .color-code.selected {
/*  box-shadow: 1px 1px 3px #0000cc, inset 1px 1px 1px #0000cc;*/
  box-shadow: 1px 0px 3px hsla(212, 79%, 48%, .6);
  border-color: #1384e7;
}

.color-code {
  border: 1px solid transparent;
  border-radius: 3px;
  min-width: 40px;
  height: 20px;
  color: #fff;
  text-shadow: 1px 0 1px darkblue, -1px 0px 2px darkblue;
  font-weight: 900;
  font-size: 14px;
  padding: 2px 4px;
  text-align: center;
  line-height: 12px;
  cursor: pointer;
  font-variant: all-small-caps;
}

.color-code span {
  position: relative;
  z-index: 1;
  mix-blend-mode: luminosity;
}

.color-code span::before {
  position: absolute;
  top: 6px;
  left: -1px;
  right: -1px;
  bottom: 4px;
  background: hsla(198, 67%, 18%, .58);
  content: ' ';
  z-index: -1;
  border-radius: 2px;
}

.btn-code.selected {
  background-color: lightblue;
  border: 1px solid #767676;
  border-radius: 3px;
}

tfoot th {
  font-weight: 400;
}

@media only screen and (min-width: 610px) {
  .presence-builder {
    min-width: 570px;
  }
}
</style>
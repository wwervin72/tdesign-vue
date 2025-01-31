/** 超出省略显示 */
import {
  defineComponent, PropType, ref, computed,
} from '@vue/composition-api';
import { TNode } from '../common';
import { renderContent } from '../utils/render-tnode';
import { isNodeOverflow } from '../utils/dom';
import TPopup, { PopupProps } from '../popup';
import { useConfig } from '../config-provider/useConfig';

export interface EllipsisProps {
  content: string | TNode;
  default: string | TNode;
  popupContent: string | number | TNode;
  placement: PopupProps['placement'];
  attach: () => HTMLElement;
  popupProps: PopupProps;
  zIndex: number;
}

export default defineComponent({
  name: 'TEllipsis',

  props: {
    /** 内容 */
    content: {
      type: [String, Function] as PropType<EllipsisProps['content']>,
    },
    /** 内容，同 content */
    default: {
      type: [String, Function] as PropType<EllipsisProps['default']>,
    },
    /** 内容，同 content，可以单独自定义浮层内容，无需和触发元素保持一致 */
    popupContent: {
      type: [String, Number, Function] as PropType<EllipsisProps['popupContent']>,
    },
    /** 浮层位置 */
    placement: String as PropType<EllipsisProps['placement']>,
    /** 挂载元素 */
    attach: Function as PropType<EllipsisProps['attach']>,
    /** 透传 Popup 组件属性 */
    popupProps: Object as PropType<EllipsisProps['popupProps']>,
    zIndex: Number,
  },

  // 空 props 是为了 TS 类型检测
  // eslint-disable-next-line
  setup(props: EllipsisProps) {
    const { classPrefix } = useConfig();
    const root = ref();
    const isOverflow = ref(false);
    const visible = ref(false);

    const ellipsisClasses = computed(() => [
      `${classPrefix.value}-table__ellipsis`,
      `${classPrefix.value}-text-ellipsis`,
    ]);

    // 当表格数据量大时，不希望默认渲染全量的 Popup，期望在用户 mouseenter 的时候再显示
    const onTriggerMouseenter = () => {
      if (!root.value) return;
      visible.value = true;
      isOverflow.value = isNodeOverflow(root.value);
    };

    const onTriggerMouseleave = () => {
      visible.value = false;
    };

    return {
      root,
      isOverflow,
      ellipsisClasses,
      visible,
      onTriggerMouseenter,
      onTriggerMouseleave,
    };
  },

  render() {
    const cellNode = renderContent(this, 'default', 'content');
    const ellipsisContent = (
      <div ref="root" class={this.ellipsisClasses}>
        {cellNode}
      </div>
    );
    let content = null;
    if (this.isOverflow) {
      const rProps = {
        content: this.popupContent || (() => cellNode),
        visible: this.visible,
        destroyOnClose: true,
        zIndex: this.zIndex,
        attach: this.attach || (() => this.root),
        placement: this.placement,
        ...(this.popupProps || {}),
      };
      content = <TPopup props={rProps}>{ellipsisContent}</TPopup>;
    } else {
      content = ellipsisContent;
    }
    return (
      <div onMouseenter={this.onTriggerMouseenter} onMouseleave={this.onTriggerMouseleave}>
        {content}
      </div>
    );
  },
});

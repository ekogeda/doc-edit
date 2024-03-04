import { useActions } from "vuex-composition-helpers/dist";
import { useRouter } from "vue-router";



export const useDragResizeComposable = () => {
  const route = useRouter();

  const { editTools } = useActions({
    editTools: "document/editTools",
  });
  const geneticFunction = (e, tool, action) => {
    const dragToUpdate = {
      append_print_id: tool.append_print != null ? tool.append_print.id : null,
      category: tool.category,
      document_upload_id: tool.document_upload_id,
      document_id: route.currentRoute.value.params.document_id,
      tool_class: tool.tool_class,
      tool_height: action == 'drag' ? tool.tool_height : e.h.toString(),
      tool_name: tool.tool_name,
      tool_pos_left: e.x.toString(),
      tool_pos_top: e.y.toString(),
      tool_width: action == 'drag' ? tool.tool_width : e.w.toString(),
      type: tool.type,
      user_id: tool.user_id,
      value: (tool.value != null) ? tool.value : "",
    };

    // if ((tool.tool_pos_left == e.x.toString() || tool.tool_pos_top == e.y.toString()) && action != 'resize') return;

    editTools({ id: tool.id, payload: dragToUpdate, action: action });
  }
  const dragEnd = (e, tool) => geneticFunction(e, tool, 'drag');

  const resizeEnd = (e, tool) => geneticFunction(e, tool, 'resize');

  return { dragEnd, resizeEnd, }
}
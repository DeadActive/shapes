import BendDragHandlerState from "./bend/BendDragHandlerState.js";
import BendDragSegmentState from "./bend/BendDragSegmentState.js";
import BendDragState from "./bend/BendDragState.js";
import BendState from "./bend/BendState.js";
import DrawNewState from "./draw/DrawNewState.js";
import DrawSplitState from "./draw/DrawSplitState.js";
import DrawState from "./draw/DrawState.js";
import EditDragHandlerState from "./edit/EditDragHandlerState.js";
import EditDragSegmentState from "./edit/EditDragSegmentState.js";
import EditDragState from "./edit/EditDragState.js";
import EditState from "./edit/EditState.js";
import SelectDragState from "./select/SelectDragState.js";
import SelectState from "./select/SelectState.js";

export default {
    select: SelectState,
    selectDrag: SelectDragState,
    edit: EditState,
    editDrag: EditDragState,
    editDragHandler: EditDragHandlerState,
    editDragSegment: EditDragSegmentState,
    draw: DrawState,
    drawNew: DrawNewState,
    drawSplit: DrawSplitState,
    bend: BendState,
    bendDrag: BendDragState,
    bendDragHandler: BendDragHandlerState,
    bendDragSegment: BendDragSegmentState
}
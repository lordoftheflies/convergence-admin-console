/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence Server, which is released under
 * the terms of the GNU General Public License version 3 (GPLv3). A copy
 * of the GPLv3 should have been provided along with this file, typically
 * located in the "LICENSE" file, which is part of this source code package.
 * Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> for the
 * full text of the GPLv3 license, if it was not provided.
 */

import {NumberElement, NumberValueEvent} from "../../../model/NumberElement";
import {TreeNode} from "./TreeNode";
import {ModelElementEvent} from "../../../model/ModelElement";

export class NumberNode extends TreeNode<NumberElement> {
  protected _handleElementEvent(e: ModelElementEvent): void {
    if (e instanceof NumberValueEvent) {
      this._emitChanged(e.remote);
    }
  }
}

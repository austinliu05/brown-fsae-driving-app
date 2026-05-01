import { PackingList } from '../types/PackingList';

export const isStandardPackingList = (packingList: PackingList) =>
    (packingList.category ?? "").trim().toLowerCase() === "standard" ||
    packingList.name.trim().toLowerCase() === "general";

export const getDefaultPackingListIds = (packingLists: PackingList[]) =>
    packingLists.filter(isStandardPackingList).map((packingList) => packingList.id);

export const sortPackingListsForDisplay = (packingLists: PackingList[]) =>
    [...packingLists].sort((left, right) => {
        const leftIsStandard = isStandardPackingList(left);
        const rightIsStandard = isStandardPackingList(right);

        if (leftIsStandard !== rightIsStandard) {
            return leftIsStandard ? -1 : 1;
        }

        const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;
        if (leftOrder !== rightOrder) {
            return leftOrder - rightOrder;
        }

        return left.name.localeCompare(right.name);
    });
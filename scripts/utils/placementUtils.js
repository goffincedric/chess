import { BoardUtils } from './boardUtils.js';
import { FILES, RANKS } from '../constants/boardConstants.js';
import { Placement } from '../models/placement.js';
import { RegexConstants } from '../constants/regexConstants.js';

function generateVerticalPlacements(currentFile, currentRank, limit, includeCurrentPlacement = false) {
    let verticals = [];
    let count, rankOffset, rank, placements;
    for (let i = 0; i < 2; i++) {
        // Reset rank and placements
        rank = null;
        placements = [];

        // Calculate rank offset
        rankOffset = i % 2 ? -1 : 1;

        // Generate placements until not on board anymore
        count = includeCurrentPlacement ? -1 : 0;
        do {
            // Add previous placement to placements
            if (rank) placements.push(new Placement(currentFile, rank));

            // Calculate new placement
            count++;
            rank = currentRank + count * rankOffset;
        } while (BoardUtils.isOnBoard(currentFile, rank) && (!limit || count <= limit));
        // Check for placements to add
        if (placements.length) verticals.push(placements);
    }

    return verticals;
}

function generateHorizontalPlacements(currentFile, currentRank, limit, includeCurrentPlacement = false) {
    let horizontals = [];
    let count, fileOffset, file, placements;
    for (let i = 0; i < 2; i++) {
        // Reset file and placements
        file = null;
        placements = [];

        // Calculate file offset
        fileOffset = i % 2 ? -1 : 1;

        // Generate placements until not on board anymore
        count = includeCurrentPlacement ? -1 : 0;
        do {
            // Add previous placement to placements
            if (file) placements.push(new Placement(file, currentRank));

            // Calculate new placement
            count++;
            file = currentFile + count * fileOffset;
        } while (BoardUtils.isOnBoard(file, currentRank) && (!limit || count <= limit));
        // Check for placements to add
        if (placements.length) horizontals.push(placements);
    }

    return horizontals;
}

function generateDiagonalPlacements(currentFile, currentRank, limit, includeCurrentPlacement = false) {
    let diagonals = [];
    let count, fileOffset, rankOffset, file, rank, placements;
    for (let i = 0; i < 4; i++) {
        // Reset file, rank and placements
        file = null;
        rank = null;
        placements = [];

        // Calculate offsets
        fileOffset = i % 2 ? -1 : 1;
        rankOffset = i >= 2 ? -1 : 1;

        // Generate placements until not on board anymore
        count = includeCurrentPlacement ? -1 : 0;
        do {
            // Add previous placement to placements
            if (file && rank) placements.push(new Placement(file, rank));

            // Calculate new placement
            count++;
            file = currentFile + count * fileOffset;
            rank = currentRank + count * rankOffset;
        } while (BoardUtils.isOnBoard(file, rank) && (!limit || count <= limit));
        // Check for placements to add
        if (placements.length) diagonals.push(placements);
    }

    return diagonals;
}

function generateVerticalPlacementsBetween(currentFile, rank1, rank2, includePlacement1, includePlacement2) {
    // Calculate smallest rank, largest rank and limit
    const minRank = Math.min(rank1, rank2);
    const maxRank = Math.max(rank1, rank2);
    const limit = maxRank - minRank;

    // Check if placements are the same and at least 1 placement is included
    if (limit === 0 && (includePlacement1 || includePlacement2)) return [new Placement(currentFile, rank1)];

    // Generate spaces for each vertical direction, starting from rank1
    const verticalDirections = generateVerticalPlacements(currentFile, rank1, limit, includePlacement1);

    // Get direction pointing to rank2
    const verticalSpaces = verticalDirections.find((directionSpaces) => directionSpaces.some((space) => space.rank === rank2));

    // Check if placement with rank2 needs to be included
    if (!includePlacement2) verticalSpaces.pop();

    // Return generates spaces
    return verticalSpaces ?? [];
}

function generateHorizontalPlacementsBetween(currentRank, file1, file2, includePlacement1, includePlacement2) {
    // Calculate smallest file, largest file and limit
    const minFile = Math.min(file1, file2);
    const maxFile = Math.max(file1, file2);
    const limit = maxFile - minFile;

    // Check if placements are the same and at least 1 placement is included
    if (limit === 0 && (includePlacement1 || includePlacement2)) return [new Placement(file1, currentRank)];

    // Generate spaces for each horizontal direction, starting from file1
    const horizontalDirections = generateHorizontalPlacements(file1, currentRank, limit, includePlacement1);

    // Get direction pointing to file2
    const horizontalSpaces = horizontalDirections.find((directionSpaces) => directionSpaces.some((space) => space.file === file2));

    // Check if placement with file2 needs to be included
    if (!includePlacement2) horizontalSpaces?.pop();

    // Return generates spaces
    return horizontalSpaces ?? [];
}

function generateDiagonalPlacementsBetween(file1, rank1, file2, rank2, includePlacement1, includePlacement2) {
    // Calculate smallest file and rank, largest file and rank and difference between ranks and files
    const minFile = Math.min(file1, file2);
    const maxFile = Math.max(file1, file2);
    const minRank = Math.min(rank1, rank2);
    const maxRank = Math.max(rank1, rank2);
    const dFile = maxFile - minFile;
    const dRank = maxRank - minRank;

    // Check if difference between ranks and files is not the same (rectangle, therefore not a straight diagonal)
    if (dFile !== dRank) return [];

    // Check if placements are the same and at least 1 placement is included
    if (dFile === 0 && (includePlacement1 || includePlacement2)) return [new Placement(file1, rank1)];

    // Generate spaces for each diagonal direction, starting from file1 and rank1
    const diagonalDirections = generateDiagonalPlacements(file1, rank1, dFile, includePlacement1);

    // Get direction pointing to file2 and rank 2
    const diagonalSpaces = diagonalDirections.find((directionSpaces) =>
        directionSpaces.some((space) => space.file === file2 && space.rank === rank2),
    );

    // Check if placement with file2 and rank2 needs to be included
    if (!includePlacement2) diagonalSpaces?.pop();

    // Return generates spaces
    return diagonalSpaces ?? [];
}

function generatePlacementsBetweenPlacements(file1, rank1, file2, rank2, includePlacement1, includePlacement2) {
    // Calculate smallest file and rank, largest file and rank and difference between ranks and files
    const minFile = Math.min(file1, file2);
    const maxFile = Math.max(file1, file2);
    const minRank = Math.min(rank1, rank2);
    const maxRank = Math.max(rank1, rank2);
    const dFile = maxFile - minFile;
    const dRank = maxRank - minRank;

    // Check if is horizontal move
    if (dFile > 0 && dRank === 0) {
        return generateHorizontalPlacementsBetween(rank1, file1, file2, includePlacement1, includePlacement2);
    } else if (dFile === 0 && dRank > 0) {
        // Check if is vertical move
        return generateVerticalPlacementsBetween(file1, rank1, rank2, includePlacement1, includePlacement2);
    } else {
        return generateDiagonalPlacementsBetween(file1, rank1, file2, rank2, includePlacement1, includePlacement2);
    }
}

function generatePlacementsLineThroughPlacements(file1, rank1, file2, rank2) {
    // Calculate smallest file and rank, largest file and rank and difference between ranks and files
    const minFile = Math.min(file1, file2);
    const maxFile = Math.max(file1, file2);
    const minRank = Math.min(rank1, rank2);
    const maxRank = Math.max(rank1, rank2);
    const dFile = maxFile - minFile;
    const dRank = maxRank - minRank;

    // Line
    let linePlacements = [];

    // Check if is horizontal move
    if (dRank === 0 && dFile > 0) {
        linePlacements = generateHorizontalPlacements(file1, rank1, RANKS, true).flat();
    } else if (dRank > 0 && dFile === 0) {
        // Check if is vertical move
        linePlacements = generateVerticalPlacements(file1, rank1, FILES, true).flat();
    } else if (dFile === dRank) {
        // Check if placement is the same
        if (file1 === file2 && rank1 === rank2) {
            return [];
        }
        // Get generate diagonals from placement with smallest file
        let smallestFilePlacements, largestFilePlacement;
        if (file1 < file2) {
            smallestFilePlacements = new Placement(file1, rank1);
            largestFilePlacement = new Placement(file2, rank2);
        } else {
            smallestFilePlacements = new Placement(file2, rank2);
            largestFilePlacement = new Placement(file1, rank1);
        }
        let diagonals = generateDiagonalPlacements(smallestFilePlacements.file, smallestFilePlacements.rank, FILES, false);

        // Get first diagonal which contains the largest placement
        let firstDiagonal = diagonals.find((diagonal) =>
            diagonal.some((placement) => placement.file === largestFilePlacement.file && placement.rank === largestFilePlacement.rank),
        );
        firstDiagonal.unshift(smallestFilePlacements);

        // Get placement opposite of largest placement in firstDiagonal
        let placementToFind;
        if (smallestFilePlacements.rank < largestFilePlacement.rank) {
            // Case for diagonal: /
            const largestPlacement = firstDiagonal.find((placement) => placement.file === 8 || placement.rank === 8);
            if (largestPlacement.file === 8) {
                placementToFind = new Placement(FILES - largestPlacement.rank + 1, 1);
            } else {
                placementToFind = new Placement(1, RANKS - largestPlacement.file + 1);
            }
        } else {
            // Case for diagonal: \
            const largestPlacement = firstDiagonal.find((placement) => placement.file === 8 || placement.rank === 1);
            // Switch file and rank for opposite side
            placementToFind = new Placement(largestPlacement.rank, largestPlacement.file);
        }

        // Get second diagonal which contains he opposite placement
        let secondDiagonal = diagonals.find((diagonal) =>
            diagonal.some((placement) => placement.file === placementToFind.file && placement.rank === placementToFind.rank),
        );

        // Merge diagonals
        linePlacements = [...secondDiagonal, ...firstDiagonal];
    }

    // Filter out duplicate placements in line
    removeDuplicatePlacements(linePlacements);

    // Return placements in line
    return linePlacements;
}

// Remove duplicate placements in array
function removeDuplicatePlacements(placements) {
    const placementIndicesToRemove = [];
    placements.reduce((visitedPlacements, placement, index) => {
        if (
            visitedPlacements.some(
                (visitedPlacement) => visitedPlacement.file === placement.file && visitedPlacement.rank === placement.rank,
            )
        ) {
            placementIndicesToRemove.push(index);
        } else {
            visitedPlacements.push(placement);
        }
        return visitedPlacements;
    }, []);

    // Remove placements from back to front
    placementIndicesToRemove.reverse();
    placementIndicesToRemove.forEach((index) => placements.splice(index, 1));
}

// Checks if arrays have placements in common
function hasPlacementsInCommon(placements, placementsToCheck) {
    return placements.some((placement) =>
        placementsToCheck.some((placementToCheck) => placementToCheck.file === placement.file && placementToCheck.rank === placement.rank),
    );
}

// Keeps or removes common placements from placements array
function filterPlacementsInCommon(placements, placementsToCheck, keepPlacements) {
    const placementIndicesToRemove = [];
    placements.forEach((placement, index) => {
        const containsDuplicate = placementsToCheck.some(
            (placementToCheck) => placementToCheck.file === placement.file && placementToCheck.rank === placement.rank,
        );
        // ^ is XOR, simplified: !keepPlacements && containsDuplicate || keepPlacements && !containsDuplicate
        if (keepPlacements ^ containsDuplicate) {
            placementIndicesToRemove.push(index);
        }
    });

    // Remove placements from back to front
    placementIndicesToRemove.reverse();
    placementIndicesToRemove.forEach((index) => placements.splice(index, 1));
}

// Generates a placement from a fen string
function fenToPlacement(fenString) {
    const regexResult = RegexConstants.FEN_MOVE.exec(fenString);
    let { file, rank } = regexResult.groups;
    return new Placement(+rank, BoardUtils.fileCharToNumber(file));
}

export const PlacementUtils = {
    generateHorizontalPlacements,
    generateVerticalPlacements,
    generateDiagonalPlacements,
    generateHorizontalPlacementsBetween,
    generateVerticalPlacementsBetween,
    generateDiagonalPlacementsBetween,
    generatePlacementsBetweenPlacements,
    generatePlacementsLineThroughPlacements,
    removeDuplicatePlacements,
    hasPlacementsInCommon,
    filterPlacementsInCommon,
    fenToPlacement,
};

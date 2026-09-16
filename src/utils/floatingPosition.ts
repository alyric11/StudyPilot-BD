export type FloatingPlacement = "above" | "below" | "left" | "right";

export interface FloatingPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: FloatingPlacement;
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), Math.max(minimum, maximum));

export const getVerticalFloatingPosition = (
  trigger: DOMRect,
  desiredWidth: number,
  estimatedHeight: number,
  gap = 8,
  viewportPadding = 10
): FloatingPosition => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(
    desiredWidth,
    Math.max(0, viewportWidth - viewportPadding * 2)
  );
  const availableBelow = Math.max(
    0,
    viewportHeight - trigger.bottom - gap - viewportPadding
  );
  const availableAbove = Math.max(
    0,
    trigger.top - gap - viewportPadding
  );
  const placement =
    availableBelow >= estimatedHeight || availableBelow >= availableAbove
      ? "below"
      : "above";
  const maxHeight = placement === "below" ? availableBelow : availableAbove;
  const renderedHeight = Math.min(estimatedHeight, maxHeight);

  return {
    top:
      placement === "below"
        ? trigger.bottom + gap
        : trigger.top - gap - renderedHeight,
    left: clamp(
      trigger.left,
      viewportPadding,
      viewportWidth - width - viewportPadding
    ),
    width,
    maxHeight,
    placement,
  };
};

export const getSideAwareFloatingPosition = (
  trigger: DOMRect,
  desiredWidth: number,
  estimatedHeight: number,
  gap = 12,
  viewportPadding = 10
): FloatingPosition => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(
    desiredWidth,
    Math.max(0, viewportWidth - viewportPadding * 2)
  );
  const rightSpace = viewportWidth - trigger.right - gap - viewportPadding;
  const leftSpace = trigger.left - gap - viewportPadding;
  const belowSpace = viewportHeight - trigger.bottom - gap - viewportPadding;
  const aboveSpace = trigger.top - gap - viewportPadding;

  let placement: FloatingPlacement;

  if (rightSpace >= width) {
    placement = "right";
  } else if (leftSpace >= width) {
    placement = "left";
  } else {
    placement = belowSpace >= aboveSpace ? "below" : "above";
  }

  const isSidePlacement = placement === "left" || placement === "right";
  const maxHeight = isSidePlacement
    ? Math.max(0, viewportHeight - viewportPadding * 2)
    : Math.max(0, placement === "below" ? belowSpace : aboveSpace);
  const renderedHeight = Math.min(estimatedHeight, maxHeight);
  const top = isSidePlacement
    ? clamp(
        trigger.top,
        viewportPadding,
        viewportHeight - renderedHeight - viewportPadding
      )
    : placement === "below"
      ? trigger.bottom + gap
      : trigger.top - gap - renderedHeight;
  const left =
    placement === "right"
      ? trigger.right + gap
      : placement === "left"
        ? trigger.left - gap - width
        : clamp(
            trigger.left,
            viewportPadding,
            viewportWidth - width - viewportPadding
          );

  return {
    top,
    left,
    width,
    maxHeight,
    placement,
  };
};

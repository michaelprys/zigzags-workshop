export const useMoveImage = (image: HTMLImageElement | null) => {
    const moveImage = (e: MouseEvent) => {
        if (!image) return;
        const rect = image.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        image.style.transformOrigin = `${x}% ${y}%`;
        image.style.transform = 'scale(1.5)';
    };
    const resetImage = () => {
        if (!image) return;
        image.style.transformOrigin = 'center center';
        image.style.transform = 'scale(1)';
    };

    return {
        moveImage,
        resetImage,
    };
};

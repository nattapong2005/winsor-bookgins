import Swal from 'sweetalert2';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

export const showAlert = (icon, title) => {
    Toast.fire({
        icon: icon,
        title: title
    });
};

export const showConfirm = (title, text, confirmButtonText = 'Yes', cancelButtonText = 'No') => {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText
    });
};

export const showPrompt = async (title, inputPlaceholder, inputValue = '') => {
    const { value: text } = await Swal.fire({
        title: title,
        input: 'text',
        inputLabel: inputPlaceholder,
        inputValue: inputValue,
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to write something!'
            }
        }
    });
    return text;
};

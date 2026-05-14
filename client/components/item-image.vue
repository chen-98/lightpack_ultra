<style lang="scss">

</style>

<template>
    <div>
        <modal id="itemImageDialog" :shown="shown" @hide="shown = false">
            <div class="columns">
                <div class="lpHalf">
                    <h2>Add image by URL</h2>
                    <form id="itemImageUrlForm" @submit.prevent="saveImageUrl()">
                        <input id="itemImageUrl" v-model="imageUrl" type="text" placeholder="Image URL">
                        <input type="submit" class="lpButton" value="Save">
                        <a class="lpHref close" @click="shown = false">Cancel</a>
                    </form>
                </div>
                <div class="lpHalf">
                    <h2>Upload image from disk</h2>
                    <template v-if="!item.image">
                        <p class="imageUploadDescription">
                            Your image will be hosted on Imgur. If upload fails, add the image by URL instead.
                        </p>
                        <button id="itemImageUpload" class="lpButton" @click="triggerImageUpload">
                            Upload Image
                        </button>
                        <a class="lpHref close" @click="shown = false">Cancel</a>
                        <p v-if="uploading">
                            Uploading image...
                        </p>
                        <p v-if="uploadError" class="lpError">
                            {{ uploadError }}
                        </p>
                    </template>
                    <template v-if="item.image">
                        <button id="itemImageUpload" class="lpButton" @click="removeItemImage">
                            Remove Image
                        </button>
                    </template>
                </div>
            </div>
        </modal>
        <form id="imageUpload" ref="imageUploadForm">
            <input id="image" type="file" name="image" ref="imageInput" @change="uploadImage">
        </form>
    </div>
</template>

<script>
import modal from './modal.vue';

export default {
    name: 'ItemImage',
    components: {
        modal,
    },
    data() {
        return {
            imageUrl: null,
            item: false,
            uploading: false,
            uploadError: '',
            shown: false,
        };
    },
    mounted() {
        bus.$on('updateItemImage', (item) => {
            this.shown = true;
            this.item = item;
            this.imageUrl = item.imageUrl;
            this.uploadError = '';
        });
    },
    methods: {
        saveImageUrl() {
            this.$store.commit('updateItemImageUrl', { imageUrl: this.imageUrl, item: this.item });
            this.shown = false;
        },
        triggerImageUpload() {
            this.$refs.imageInput.click();
        },
        resetImageInput() {
            if (this.$refs.imageInput) {
                this.$refs.imageInput.value = '';
            }
        },
        uploadImage(evt) {
            this.uploadError = '';
            if (!FormData) {
                this.uploadError = 'Your browser is not supported for file uploads. Please update to a more modern browser.';
                this.resetImageInput();
                return;
            }
            const file = evt.target.files[0];
            if (!file) {
                this.resetImageInput();
                return;
            }
            const name = file.name;
            const size = file.size;
            const type = file.type;

            if (name.length < 1) {
                this.resetImageInput();
                return;
            }
            if (size > 2500000) {
                this.uploadError = 'Please upload a file less than 2.5mb.';
                this.resetImageInput();
                return;
            }
            if (['image/png', 'image/jpg', 'image/jpeg', 'image/gif'].indexOf(type) === -1) {
                this.uploadError = 'Please upload a PNG, JPG, or GIF image.';
                this.resetImageInput();
                return;
            }
            const formData = new FormData(this.$refs.imageUploadForm);

            this.uploading = true;

            return fetchJson('/imageUpload', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
            })
                .then((response) => {
                    this.uploading = false;
                    this.$store.commit('updateItemImage', { image: response.data.id, item: this.item });
                    this.shown = false;
                    this.resetImageInput();
                }).catch((response) => {
                    this.uploading = false;
                    this.uploadError = response.message || 'Upload failed. Please try again later or add the image by URL.';
                    this.resetImageInput();
                });
        },
        removeItemImage() {
            this.$store.commit('removeItemImage', this.item);
            this.item.image = '';
        },
    },
};
</script>

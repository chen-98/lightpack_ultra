<style lang="scss">

#feedback {
    width: 560px;
}

</style>

<template>
    <modal id="feedback" :shown="shown" @hide="shown = false">
        <h2>Feedback</h2>

        <p>Bug reports and improvement ideas are both welcome during beta.</p>
        <p>
            Email
            <a class="lpHref" href="mailto:info@lighterpack.com?subject=LighterPack%20beta%20feedback">info@lighterpack.com</a>
            or use the button below.
        </p>
        <p>Helpful details to include:</p>
        <ul>
            <li>A short description of the issue or idea</li>
            <li>Steps to reproduce, if it is a bug</li>
            <li>A screenshot, if it helps explain the problem</li>
            <li>A shared list link, if the feedback is about a specific list</li>
            <li>Your browser and device information</li>
        </ul>
        <p>
            <a class="lpButton" href="mailto:info@lighterpack.com?subject=LighterPack%20beta%20feedback">Email feedback</a>
        </p>
    </modal>
</template>

<script>
import modal from './modal.vue';

export default {
    name: 'Feedback',
    components: {
        modal,
    },
    data() {
        return {
            shown: false,
        };
    },
    beforeMount() {
        bus.$on('showFeedback', () => {
            this.shown = true;
        });
    },
};
</script>

<template>
	<div class="custom-md-none sidebar-left">
		<div class="sidebar">
			<div class="email-app-sidebar">
				<div class="email-app-menu">
					<div class="sidebar-menu-list sidebar-nav sticky" style="width: 260px">
						<div class="list-group list-group-messages">
							<div v-if="isDocLoading" class="list-group-item my-1">
								<PuSkeleton width="100" height="20px" />
								<div class="mb-1" />
								<PuSkeleton width="100" height="20px" />
							</div>
							<template v-else>
								<template v-if="type !== 'xs' && isOwner">
									<div class="list-group-item px-1 w-100" :class="[type === 'md' ? 'mt-5' : 'mt-1']">
										<NextButton @goToNextTool="scrollToNextTool" />
									</div>
								</template>

								<template v-if="isOwner && toolData != null">
									<div class="list-group-item px-1">
										<DropdownMenu :tool="toolData.tool" :user="toolData.user" location="asideRight" />
									</div>
								</template>

								<div class="list-group-item px-1">
									<UserActivities />
								</div>
							</template>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import NextButton from '@/components/Document/Edit/Main/NextButton.vue';
import DropdownMenu from '@/components/DropdownMenu.vue';
import UserActivities from '@/components/UserActivities.vue';
import { defineProps } from 'vue';
import { useGetters } from 'vuex-composition-helpers/dist';
import { useBreakpointsComposable } from '@/composables/useBreakpoints';
const { type } = useBreakpointsComposable();

const { isDocLoading, toolData } = useGetters({
	isDocLoading: 'document/isDocLoading',
	toolData: 'document/toolData',
});

defineProps({ isOwner: Boolean });

const scrollToNextTool = (toolId) => {
	const nextToolElement = document.getElementById(`userTools-${toolId}`);
	if (nextToolElement) {
		nextToolElement.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
			inline: 'nearest',
		});

		const spanElement = nextToolElement.querySelector('.tooltiptext');
		if (spanElement) spanElement.style.visibility = 'visible';
	}
};
</script>

<style scoped>
.email-app-sidebar {
	background: transparent !important;
}

.sidebar-nav.sticky {
	position: fixed !important;
	top: 165px;
	bottom: 0;
	background-color: #fff;
}

.email-application .content-area-wrapper .sidebar .list-group .list-group-item:hover {
	color: #6e6b7b !important;
}

@media screen and (max-width: 1160px) {
	.custom-md-none {
		display: none;
	}
}
</style>

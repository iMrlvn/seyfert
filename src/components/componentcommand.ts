import type { ExtraProps, RegisteredMiddlewares, UsingClient } from '../commands';
import { ComponentType } from '../types';
import type { ComponentContext, ContextComponentCommandInteractionMap } from './componentcontext';

export const InteractionCommandType = {
	COMPONENT: 0,
	MODAL: 1,
} as const;

export interface ComponentCommand {
	__filePath?: string;
}

export abstract class ComponentCommand {
	type = InteractionCommandType.COMPONENT;
	abstract componentType: keyof ContextComponentCommandInteractionMap;
	customId?: string | RegExp;
	filter?(context: ComponentContext<typeof this.componentType>): Promise<boolean> | boolean;
	abstract run(context: ComponentContext<typeof this.componentType>): any;

	/** @internal */
	_filter(context: ComponentContext) {
		if (this.customId) {
			const isString = typeof this.customId === 'string';
			const matches = isString ? this.customId === context.customId : (this.customId as RegExp).test(context.customId);

			if (!matches) return false;
		}
		if (this.filter) return this.filter(context);
		return true;
	}

	middlewares: (keyof RegisteredMiddlewares)[] = [];

	props!: ExtraProps;

	get cType(): number {
		return ComponentType[this.componentType];
	}

	onBeforeMiddlewares?(context: ComponentContext): any;
	onAfterRun?(context: ComponentContext, error: unknown | undefined): any;
	onRunError?(context: ComponentContext, error: unknown): any;
	onMiddlewaresError?(context: ComponentContext, error: string): any;
	onInternalError?(client: UsingClient, error?: unknown): any;
}

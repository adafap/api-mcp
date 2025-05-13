import { z } from "zod";

export const DataSourceSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	type: z.enum(["rest", "graphql", "database"]),
	config: z.object({
		baseUrl: z.string().optional(),
		endpoints: z
			.array(
				z.object({
					path: z.string(),
					method: z.string(),
					parameters: z.record(
						z.object({
							type: z.string(),
							description: z.string().optional(),
							required: z.boolean().optional(),
						}),
					),
				}),
			)
			.optional(),
		connectionString: z.string().optional(),
	}),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type DataSource = z.infer<typeof DataSourceSchema>;

import { v } from 'convex/values';
import { internalMutation } from './_generated/server';

export const upsertFromClerk = internalMutation({
  args: {
    // Convex resive muchos datos en lugar de unos pocos, por lo que hay que hacerlo tolerable por medio de any
    data: v.any(), 
  },
  handler: async (ctx, { data }) => {
    const nombre = `${typeof data.first_name === 'string' ? data.first_name : ''} ${typeof data.last_name === 'string' ? data.last_name : ''}`.trim();
    const correo = data.email_addresses[0].email_address;

    const existingUser = await ctx.db
      .query('user')
      .filter((q) => q.eq(q.field('idClerk'), data.id))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        nombre,
        correo,
        updatedAt: data.updated_at,
      });
      console.log(`User ${data.id} updated in Convex.`);
    } else {
      await ctx.db.insert('user', {
        idClerk: data.id,
        nombre,
        correo,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
      console.log(`User ${data.id} created in Convex.`);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.db
      .query('user')
      .filter((q) => q.eq(q.field('idClerk'), clerkUserId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
      console.log(`User ${clerkUserId} deleted from Convex.`);
    }
  },
});
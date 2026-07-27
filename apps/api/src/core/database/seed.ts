import mongoose from "mongoose";
import * as argon2 from "argon2";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, select: false },
    githubId: { type: String, sparse: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String },
    emailVerified: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const membershipSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "developer", "viewer"],
      required: true,
    },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    joinedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

membershipSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

const projectSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "folder" },
    color: { type: String, default: "#6366f1" },
    visibility: { type: String, enum: ["private", "public"], default: "private" },
    status: { type: String, enum: ["active", "archived", "paused", "draft"], default: "active" },
    archived: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

projectSchema.index({ organizationId: 1, slug: 1 }, { unique: true });

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshTokenHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const UserModel = mongoose.model("User", userSchema);
const OrgModel = mongoose.model("Organization", organizationSchema);
const MembershipModel = mongoose.model("Membership", membershipSchema);
const ProjectModel = mongoose.model("Project", projectSchema);
const SessionModel = mongoose.model("Session", sessionSchema);

const agentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    provider: { type: String, default: "openai" },
    model: { type: String, default: "gpt-4o" },
    capabilities: { type: [String], default: [] },
    status: { type: String, default: "idle" },
    currentTaskId: { type: mongoose.Schema.Types.ObjectId, default: null },
    metadata: { type: Object, default: {} },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
const AgentModel = mongoose.model("Agent", agentSchema);

async function seed() {
  const uri =
    process.env.MONGODB_URI ??
    "mongodb://admin:password@localhost:27017/forge?authSource=admin";
  console.log(`Connecting to MongoDB at ${uri}...`);

  await mongoose.connect(uri);
  console.log("Connected to MongoDB\n");

  await UserModel.deleteMany({});
  await OrgModel.deleteMany({});
  await MembershipModel.deleteMany({});
  await ProjectModel.deleteMany({});
  await SessionModel.deleteMany({});
  await AgentModel.deleteMany({});

  console.log("Cleared existing data\n");

  const passwordHash = await argon2.hash("password123");

  const users = await UserModel.create([
    { email: "alice@example.com", passwordHash, name: "Alice", emailVerified: true },
    { email: "bob@example.com", passwordHash, name: "Bob", emailVerified: true },
    { email: "bruno@example.com", passwordHash, name: "Bruno", emailVerified: true },
  ]);
  const [alice, bob, bruno] = users;

  console.log(`Created ${3} users`);

  const orgs = await OrgModel.create([
    { name: "Forge", slug: "forge", ownerId: bruno!._id },
    { name: "Kibanda", slug: "kibanda", ownerId: alice!._id },
    { name: "Client A", slug: "client-a", ownerId: bob!._id },
    { name: "Client B", slug: "client-b", ownerId: alice!._id },
  ]);
  const [forge, kibanda, clientA, clientB] = orgs;

  console.log(`Created ${4} organizations`);

  const memberships = await MembershipModel.create([
    { organizationId: forge!._id, userId: bruno!._id, role: "owner" },
    { organizationId: forge!._id, userId: alice!._id, role: "admin" },
    { organizationId: forge!._id, userId: bob!._id, role: "developer" },

    { organizationId: kibanda!._id, userId: alice!._id, role: "owner" },
    { organizationId: kibanda!._id, userId: bruno!._id, role: "admin" },
    { organizationId: kibanda!._id, userId: bob!._id, role: "viewer" },

    { organizationId: clientA!._id, userId: bob!._id, role: "owner" },
    { organizationId: clientA!._id, userId: bruno!._id, role: "developer" },
    { organizationId: clientA!._id, userId: alice!._id, role: "viewer" },

    { organizationId: clientB!._id, userId: alice!._id, role: "owner" },
    { organizationId: clientB!._id, userId: bruno!._id, role: "viewer" },
    { organizationId: clientB!._id, userId: bob!._id, role: "developer" },
  ]);

  console.log(`Created ${memberships.length} memberships`);

  const projects = await ProjectModel.create([
    {
      organizationId: forge!._id,
      name: "Forge Engine",
      slug: "forge-engine",
      description: "Core AI agent orchestration engine",
      icon: "cpu",
      color: "#6366f1",
      visibility: "private",
      status: "active",
      createdBy: bruno!._id,
    },
    {
      organizationId: forge!._id,
      name: "Forge Dashboard",
      slug: "forge-dashboard",
      description: "Web dashboard for monitoring agents",
      icon: "layout-dashboard",
      color: "#06b6d4",
      visibility: "public",
      status: "active",
      createdBy: alice!._id,
    },
    {
      organizationId: kibanda!._id,
      name: "Kibanda Mobile",
      slug: "kibanda-mobile",
      description: "Mobile ordering application",
      icon: "smartphone",
      color: "#f59e0b",
      visibility: "private",
      status: "draft",
      createdBy: alice!._id,
    },
    {
      organizationId: clientA!._id,
      name: "Legacy Migration",
      slug: "legacy-migration",
      description: "Data migration from legacy system",
      icon: "database",
      color: "#ef4444",
      visibility: "private",
      status: "paused",
      createdBy: bob!._id,
    },
  ]);

  console.log(`Created ${projects.length} projects`);

  // Create agents for all orgs
  const agentTypes = [
    { type: "planner", name: "Planner", capabilities: ["planning", "decomposition"] },
    { type: "backend", name: "Backend Engineer", capabilities: ["typescript", "nestjs", "mongodb"] },
    { type: "frontend", name: "Frontend Engineer", capabilities: ["react", "nextjs", "tailwind"] },
    { type: "testing", name: "QA Engineer", capabilities: ["jest", "testing-library"] },
    { type: "reviewer", name: "Code Reviewer", capabilities: ["code-review", "security"] },
    { type: "browser", name: "Browser Agent", capabilities: ["playwright", "web-automation", "screenshot"] },
  ];

  const provider = process.env.AI_PROVIDER ?? "deepseek";
  const model = process.env.AI_PROVIDER_MODEL ?? "deepseek-chat";

  const agentDocs = orgs.flatMap((org) =>
    agentTypes.map((a) => ({
      organizationId: org._id,
      name: a.name,
      type: a.type,
      provider,
      model,
      capabilities: a.capabilities,
      status: "idle",
    }))
  );

  await AgentModel.insertMany(agentDocs);
  console.log(`Created ${agentDocs.length} agents (${agentTypes.length} types × ${orgs.length} orgs)`);

  console.log("\n--- Bruno's organizations ---");
  const brunoMemberships = await MembershipModel.find({
    userId: bruno!._id,
    deletedAt: null,
  }).populate("organizationId");

  for (const m of brunoMemberships) {
    const org = m.organizationId as unknown as { name: string; slug: string };
    console.log(`  ${org.name} (${org.slug}) — ${m.role}`);
  }

  console.log("\nSeed completed successfully");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

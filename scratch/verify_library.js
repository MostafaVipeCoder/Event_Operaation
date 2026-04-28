import { createLibraryResource, getLibraryResources, deleteLibraryResource } from '../src/lib/api';

async function verify() {
    const eventA = "9c5a305c-6353-41ff-9c76-2327e3ada1e1";
    const eventB = "bc32fb64-c978-4a74-833b-4f792bae6967";

    console.log("Creating Central Resource...");
    const central = await createLibraryResource({
        title_en: "Central Test",
        title_ar: "اختبار مركزي",
        resource_type: "readable",
        url: "https://example.com/central",
        is_central: true,
        event_id: null
    });

    console.log("Creating Local Resource for Event A...");
    const localA = await createLibraryResource({
        title_en: "Local A",
        title_ar: "محلي أ",
        resource_type: "link",
        url: "https://example.com/local-a",
        is_central: false,
        event_id: eventA
    });

    console.log("Checking Event B resources...");
    const bResources = await getLibraryResources(eventB);
    const hasCentral = bResources.some(r => r.resource_id === central.resource_id);
    const hasLocalA = bResources.some(r => r.resource_id === localA.resource_id);

    console.log(`Event B sees Central: ${hasCentral}`);
    console.log(`Event B sees Local A: ${hasLocalA}`);

    if (hasCentral && !hasLocalA) {
        console.log("✅ Central sync verification PASSED.");
    } else {
        console.log("❌ Central sync verification FAILED.");
    }

    // Cleanup
    console.log("Cleaning up...");
    await deleteLibraryResource(central.resource_id);
    await deleteLibraryResource(localA.resource_id);
}

verify().catch(console.error);

"use client";

import React from "react";

export default function AboutUsStep() {
  return (
    <section className="space-y-8">
      {/* ✅ FIRST: Green Banner (like screenshot) */}
      <div className="rounded-2xl border overflow-hidden bg-white">
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 px-6 md:px-12 py-12 md:py-16 text-center">
          <h3 className="text-white text-3xl md:text-5xl font-bold tracking-tight">
            Think Insurance First
          </h3>
          <p className="text-white/85 mt-3 text-sm md:text-base font-medium">
            Empowering agents is our #1 priority.
          </p>
        </div>

        <div className="px-6 md:px-12 py-6 md:py-8 text-center">
          <p className="text-sm md:text-base text-slate-600 leading-7 max-w-3xl mx-auto">
            Think Insurance First truly understands the value of Medicare coverage and the impact it
            has on seniors and their families. That’s why we focus on maximizing benefits and
            getting clients money back while ensuring agents earn what they deserve — $200+ per deal.
          </p>
        </div>
      </div>

      {/* ✅ Agents. First. */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-6 md:px-12 py-10 md:py-14 bg-slate-50 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-emerald-900">
            Agents. First.
          </h2>
          <p className="mt-4 text-sm md:text-base text-slate-600 max-w-3xl mx-auto leading-7">
            The independent insurance agents who work with Think Insurance First have a passion for
            helping seniors get the Medicare coverage they deserve. It’s not just a name, it’s our
            entire identity. Your success is our mission.
          </p>
        </div>

        {/* A Perfect Fit + Built for You */}
        <div className="px-6 md:px-12 py-10 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold text-emerald-900">
                A Perfect Fit.
              </h3>
              <p className="mt-4 text-slate-600 leading-7">
                Think Insurance First is a Medicare-focused platform that partners with leading
                Medicare carriers across the country. This gives your clients more options and gives
                you the tools to ensure the best coverage for every situation.
              </p>
              <p className="mt-4 text-slate-600 leading-7">
                Our streamlined portal makes submitting deals faster and getting paid easier than
                ever.
              </p>
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-semibold text-emerald-900">
                Built for You.
              </h3>
              <p className="mt-4 text-slate-600 leading-7">
                We provide the resources, technology, and support for your growth and success. From
                lead generation to deal submission to commission tracking—everything you need is in
                one place.
              </p>
              <p className="mt-4 text-slate-600 leading-7">
                Focus on what you do best—helping seniors—while we handle the rest.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How Can We Help You? */}
      <div className="rounded-2xl border bg-white px-6 md:px-12 py-10">
        <h3 className="text-2xl md:text-3xl font-semibold text-slate-900">
          How Can We Help You?
        </h3>
        <p className="mt-2 text-sm md:text-base text-emerald-800 font-semibold">
          Think Insurance First provides comprehensive solutions for Medicare agents.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <h4 className="text-xl font-semibold text-emerald-900">
              Maximum Benefits for Clients
            </h4>
            <p className="mt-3 text-slate-600 leading-7">
              We don’t just find coverage—we maximize benefits. Our platform helps you identify
              plans that give your clients money back, extra benefits, and the most value.
            </p>
          </div>

          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <h4 className="text-xl font-semibold text-emerald-900">
              Get Clients Money Back
            </h4>
            <p className="mt-3 text-slate-600 leading-7">
              Helping seniors get money back through their Medicare plans is a game-changer for
              enrollment success. We help you show clients real savings.
            </p>
          </div>

          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <h4 className="text-xl font-semibold text-emerald-900">
              $200+ Per Deal
            </h4>
            <p className="mt-3 text-slate-600 leading-7">
              You work hard for every client—we make sure you’re rewarded. Earn $200 or more per
              deal with competitive commission rates and fast payouts.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="rounded-2xl border bg-slate-50 px-6 md:px-12 py-10">
        <p className="text-slate-700 italic leading-8 max-w-4xl">
          “Today I helped a client switch to a plan that gives them $200 back every month for
          groceries and prescriptions. They were shocked they could get money back through Medicare.
          Think Insurance First makes it so easy to maximize benefits—I earned $250 on that deal and
          my client couldn’t be happier. This platform changed my business.”
        </p>
        <p className="mt-4 font-semibold text-emerald-900">
          — Sarah M., Independent Medicare Agent
        </p>
      </div>

      {/* Growing Together */}
      <div className="rounded-2xl border bg-white px-6 md:px-12 py-10">
        <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 text-center">
          Growing Together
        </h3>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-bold text-emerald-900">50</div>
            <div className="mt-2 text-slate-600">States Covered</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-emerald-900">24/7</div>
            <div className="mt-2 text-slate-600">Agent Support</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-emerald-900">100%</div>
            <div className="mt-2 text-slate-600">Agent-Focused</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl overflow-hidden border">
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 px-6 md:px-12 py-12 text-center">
          <h3 className="text-2xl md:text-4xl font-semibold text-white">
            Ready to Put Your Business First?
          </h3>
          <p className="mt-4 text-white/80 max-w-3xl mx-auto leading-7">
            Join the growing community of Medicare agents who are building successful businesses
            with Think Insurance First. We provide the platform, you provide the passion.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <button
              type="button"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-emerald-900 hover:bg-white/90 transition"
            >
              Become an Agent
            </button>
            <button
              type="button"
              className="rounded-xl border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { features } from "@/data/content";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SectionHeading } from "@/components/ui/section-heading";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { emptyVotes, STORAGE_KEYS } from "@/utils/storage";
import type { FeatureId } from "@/types";

export function VotingSection() {
  const [votes, setVotes] = useLocalStorage(STORAGE_KEYS.votes, emptyVotes);
  const [choice, setChoice] = useLocalStorage<FeatureId | null>("aulaenlace:vote-choice", null);
  const [selected, setSelected] = useState<FeatureId | null>(choice);
  const [confirmed, setConfirmed] = useState(false);
  const total = useMemo(() => Object.values(votes).reduce((sum, value) => sum + value, 0), [votes]);

  const submitVote = useCallback(
    (featureId?: FeatureId | null) => {
      const nextChoice = featureId ?? selected;
      if (!nextChoice) return;
      setVotes((current) => {
        const next = { ...current };
        if (choice && next[choice] > 0) next[choice] -= 1;
        next[nextChoice] += 1;
        return next;
      });
      setChoice(nextChoice);
      setSelected(nextChoice);
      setConfirmed(true);
    },
    [choice, selected, setChoice, setVotes],
  );

  useEffect(() => {
    const handleVote = (event: Event) => submitVote((event as CustomEvent<FeatureId>).detail);
    window.addEventListener("aulaenlace:vote", handleVote);
    return () => window.removeEventListener("aulaenlace:vote", handleVote);
  }, [submitVote]);

  return (
    <section className="section vote-section" id="participar">
      <div className="container vote-layout">
        <div>
          <SectionHeading
            eyebrow="Tu criterio orienta el proyecto"
            title="¿Qué función sería más útil?"
            description="Este sondeo exploratorio no representa resultados de investigación. Los votos quedan guardados únicamente en este dispositivo."
          />
          <div className="vote-note">
            <Lightbulb />
            <p>
              <strong>Una hipótesis, no una conclusión</strong>
              <span>
                La función innovadora se decidirá después de escuchar y contrastar experiencias
                reales.
              </span>
            </p>
          </div>
        </div>
        <motion.div
          className="vote-card"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <RadioGroup
            value={selected ?? ""}
            onValueChange={(value) => {
              setSelected(value as FeatureId);
              setConfirmed(false);
            }}
            aria-label="Selecciona la función más útil"
          >
            {features.map((feature) => {
              const percentage = total ? Math.round((votes[feature.id] / total) * 100) : 0;
              return (
                <label
                  className={`vote-option ${selected === feature.id ? "selected" : ""}`}
                  key={feature.id}
                >
                  <RadioGroupItem value={feature.id} />
                  <span className="vote-copy">
                    <strong>{feature.title}</strong>
                    <span>{feature.description}</span>
                    <span className="vote-progress">
                      <i style={{ width: `${percentage}%` }} />
                    </span>
                  </span>
                  <b>{votes[feature.id]}</b>
                </label>
              );
            })}
          </RadioGroup>
          <div className="vote-actions">
            <button
              type="button"
              className="primary-button"
              disabled={!selected}
              onClick={() => submitVote()}
            >
              Registrar mi voto
            </button>
            <span>
              {total} {total === 1 ? "voto" : "votos"} en este dispositivo
            </span>
          </div>
          {confirmed ? (
            <p className="success-message" role="status">
              <CheckCircle2 />
              Tu voto quedó registrado localmente.
            </p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
